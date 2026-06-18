import { Component, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { environment } from 'src/environments/environment';
import { GlobalComponent } from 'src/app/global-component';
import * as L from 'leaflet';
import 'leaflet.markercluster';

interface SosTrackerEntry {
  marker: L.Marker;
  userId: number;
  lat: number;
  lng: number;
}

const datePipe = new DatePipe('en-US');

@Component({
  selector: 'app-sos-alert-map',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './sos-alert-map.component.html',
  styleUrl: './sos-alert-map.component.scss',
})
export class SosAlertMapComponent implements AfterViewInit, OnDestroy {
  breadCrumbItems: Array<{}> = [
    { label: 'Monitoring' },
    { label: 'SOS Alerts', link: '/monitoring/sos-alerts' },
    { label: 'Live Map', active: true },
  ];

  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' = 'connecting';
  activeAlertCount = 0;

  private map: L.Map | null = null;
  private clusterGroup!: L.MarkerClusterGroup;
  private socket: WebSocket | null = null;
  private token = localStorage.getItem('token') ?? '';

  private activeAlerts = new Map<number, SosTrackerEntry>();
  private userToAlertId = new Map<number, number>();

  private readonly WS_URL = GlobalComponent.WS_SOS_LOCATION;
  private readonly DEFAULT_CENTER: L.LatLngExpression = [23.0225, 72.5714];
  private readonly DEFAULT_ZOOM = 12;

  constructor(private zone: NgZone) { }

  ngAfterViewInit(): void {
    this.initMap();
    this.connectWebSocket();
  }

  private initMap(): void {
    this.map = L.map('sos-map', {
      center: this.DEFAULT_CENTER,
      zoom: this.DEFAULT_ZOOM,
      attributionControl: false,
    });

    L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${environment.mapbox.publicKey}`,
      {
        attribution: '',
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 19,
      }
    ).addTo(this.map);

    this.clusterGroup = L.markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 40,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="sos-cluster"><span>${count}</span></div>`,
          className: '',
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });
      },
    });

    this.clusterGroup.addTo(this.map);
    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  private connectWebSocket(): void {
    try {
      this.socket = new WebSocket(this.WS_URL + `?token=${encodeURIComponent(this.token)}`);

      this.socket.onopen = () => {
        this.zone.run(() => {
          this.connectionStatus = 'connected';
          this.socket?.send(JSON.stringify({ type: 'sos_active_list' }));
        });
      };

      this.socket.onmessage = (event: MessageEvent) => {
        this.zone.run(() => {
          try {
            this.handleEvent(JSON.parse(event.data));
          } catch (error) {
            console.error('[SOS Map] JSON parse error:', error);
          }
        });
      };

      this.socket.onerror = () =>
        this.zone.run(() => (this.connectionStatus = 'error'));

      this.socket.onclose = (event: CloseEvent) => {
        this.zone.run(() => {
          if (event.code === 1006) console.error('[SOS Map] Abnormal closure — check auth/network');
          this.connectionStatus = 'disconnected';
        });
      };

    } catch (error) {
      console.error('[SOS Map] Socket creation failed:', error);
    }
  }

  private handleEvent(payload: any): void {
    switch (payload.type) {
      case 'sos_active_list': this.onActiveList(payload); break;
      case 'sos.triggered': this.handleIncomingAlert(payload); break;
      case 'location.update.sos': this.onLocationUpdate(payload); break;
      case 'sos.resolved.admin': this.onSosResolved(payload); break;
      default: console.warn('[SOS Map] Unhandled event:', payload.type);
    }
  }

  private onActiveList(payload: any): void {
    if (!this.map || !Array.isArray(payload.data) || payload.data.length === 0) return;

    payload.data.forEach((item: any) => {
      const sosAlertId: number = item.id;
      if (this.activeAlerts.has(sosAlertId)) return;

      const loc = item.user_location;
      const user = loc.user ?? {};
      const lat = Number(loc.latitude);
      const lng = Number(loc.longitude);
      const userId = Number(user.id);
      const batteryLevel = loc.battery_level ?? null;
      const triggeredAt = item.triggered_at ?? null;

      this.placeMarker(sosAlertId, userId, lat, lng, user, batteryLevel, triggeredAt);
    });

    this.activeAlertCount = this.activeAlerts.size;
    this.fitBoundsToAlerts();
  }

  handleIncomingAlert(payload: any): void {
    if (!this.map) return;

    const data = payload.data;
    const loc = data.user_location;
    const user = loc.user ?? {};
    const lat = Number(loc.latitude);
    const lng = Number(loc.longitude);
    const sosAlertId = Number(data.id);
    const userId = Number(user.id);
    const batteryLevel: number | null = data.battery_level ?? loc.battery_level ?? null;
    const triggeredAt: string | null = data.triggered_at ?? null;

    // Replace if re-triggered
    if (this.activeAlerts.has(sosAlertId)) this.removeAlert(sosAlertId);

    this.placeMarker(sosAlertId, userId, lat, lng, user, batteryLevel, triggeredAt);
    this.activeAlertCount = this.activeAlerts.size;

    this.map.flyTo([lat, lng], 15, { animate: true, duration: 1.2 });
  }

  private onLocationUpdate(payload: any): void {
    const data = payload.data;
    const userId = Number(data.user.id);
    const lat = Number(data.latitude);
    const lng = Number(data.longitude);

    const sosAlertId = this.userToAlertId.get(userId);
    if (sosAlertId === undefined) return;

    const entry = this.activeAlerts.get(sosAlertId);
    if (!entry) return;

    this.animateLatLng(entry.marker, lat, lng);
    entry.lat = lat;
    entry.lng = lng;
  }

  private onSosResolved(payload: any): void {
    const sosAlertId = Number(payload.sos_alert_id);
    const entry = this.activeAlerts.get(sosAlertId);
    if (!entry) return;

    const { lat, lng } = entry;
    this.removeAlert(sosAlertId);
    this.flyToNearest(lat, lng);
  }

  private placeMarker(
    sosAlertId: number,
    userId: number,
    lat: number,
    lng: number,
    user: any,
    batteryLevel: number | null,
    triggeredAt: string | null,
  ): void {
    if (!this.map) return;

    const marker = L.marker([lat, lng], { icon: this.createSosIcon(user) });
    marker.bindPopup(this.buildPopupHtml(user, batteryLevel, triggeredAt), { autoPan: false });
    marker.on('click', () => {
      if (!this.map) return;

      // bindPopup's internal handler already opened the popup in this same
      // synchronous tick — close it before the browser paints so there is no flash.
      marker.closePopup();

      const latlng = marker.getLatLng();
      const targetZoom = Math.max(this.map.getZoom(), 17);

      const openWithSpiderfy = () => {
        const parent = this.clusterGroup.getVisibleParent(marker);
        if (parent && parent !== (marker as any)) {
          // Marker is still inside a cluster — spiderfy first, then show popup
          (parent as any).spiderfy();
          setTimeout(() => marker.openPopup(), 300);
        } else {
          marker.openPopup();
        }
      };

      this.map.flyTo(latlng, targetZoom, { animate: true, duration: 0.8 });
      this.map.once('moveend', openWithSpiderfy);
    });

    this.clusterGroup.addLayer(marker);

    this.activeAlerts.set(sosAlertId, { marker, userId, lat, lng });
    this.userToAlertId.set(userId, sosAlertId);
  }

  private removeAlert(sosAlertId: number): void {
    const entry = this.activeAlerts.get(sosAlertId);
    if (!entry) return;

    this.clusterGroup.removeLayer(entry.marker);
    this.userToAlertId.delete(entry.userId);
    this.activeAlerts.delete(sosAlertId);
    this.activeAlertCount = this.activeAlerts.size;
  }

  private fitBoundsToAlerts(): void {
    if (!this.map || this.activeAlerts.size === 0) return;

    if (this.activeAlerts.size === 1) {
      const entry = this.activeAlerts.values().next().value as SosTrackerEntry;
      this.map.flyTo([entry.lat, entry.lng], 15, { animate: true, duration: 1.0 });
      return;
    }

    const group = L.featureGroup(Array.from(this.activeAlerts.values()).map(e => e.marker));
    this.map.fitBounds(group.getBounds().pad(0.25), { animate: true, maxZoom: 15 });
  }

  private flyToNearest(fromLat: number, fromLng: number): void {
    if (!this.map || this.activeAlerts.size === 0) return;

    let nearest: SosTrackerEntry | null = null;
    let minDist = Infinity;

    this.activeAlerts.forEach(entry => {
      const d = Math.hypot(entry.lat - fromLat, entry.lng - fromLng);
      if (d < minDist) { minDist = d; nearest = entry; }
    });

    if (nearest) {
      const latlng = (nearest as SosTrackerEntry).marker.getLatLng();
      this.map.flyTo(latlng, this.map.getZoom(), { animate: true, duration: 1.0 });
    }
  }

  private animateLatLng(target: L.Marker | L.Circle, toLat: number, toLng: number, durationMs = 700): void {
    const from = target.getLatLng();
    const fromLat = from.lat;
    const fromLng = from.lng;
    const t0 = performance.now();

    const tick = (now: number) => {
      const p = Math.min((now - t0) / durationMs, 1);
      const ease = 1 - Math.pow(1 - p, 3); // ease-out cubic
      target.setLatLng([fromLat + (toLat - fromLat) * ease, fromLng + (toLng - fromLng) * ease]);
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  private createSosIcon(user: any): L.DivIcon {
    const initials = this.getInitials(user?.full_name);
    const bg = user?.profile_picture ? 'transparent' : this.getAvatarColor(user?.full_name ?? '');
    const inner = user?.profile_picture
      ? `<img src="${user.profile_picture}"
             style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
             onerror="this.parentElement.innerHTML='<span style=line-height:40px>${initials}</span>'" />`
      : `<span style="line-height:40px">${initials}</span>`;

    return L.divIcon({
      html: `<div class="sos-pin" style="background:${bg}">${inner}</div>`,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -24],
    });
  }

  private getInitials(name?: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length === 1
      ? parts[0].substring(0, 2).toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  private getAvatarColor(name: string): string {
    const palette = ['#405189', '#0ab39c', '#f06548', '#299cdb', '#f7b84b', '#6c757d'];
    let hash = 0;
    for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xfffff;
    return palette[hash % palette.length];
  }

  private buildPopupHtml(user: any, batteryLevel: number | null, triggeredAt: string | null): string {
    const batteryColor =
      batteryLevel === null ? '#6c757d'
        : batteryLevel > 30 ? '#28a745'
          : batteryLevel > 15 ? '#fd7e14'
            : '#dc3545';
    const triggered = triggeredAt ? datePipe.transform(triggeredAt, 'dd-MM-yyyy H:mm:ss') : '-';

    return `
      <div style="min-width:220px;font-family:sans-serif;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.15)">
        <div style="background:#dc3545;color:#fff;padding:8px 12px;font-weight:700;display:flex;align-items:center;gap:6px">
          <i class="ri-alarm-warning-line" style="font-size:1rem"></i>
          <span>Active SOS Alert</span>
        </div>
        <div style="padding:10px 12px;border:1px solid rgba(220,53,69,.25);border-top:none;border-radius:0 0 8px 8px">
          <p style="margin:0 0 8px;font-weight:600;font-size:.95em">${user.full_name ?? 'Unknown'}</p>
          <p style="margin:0 0 5px;color:#555;font-size:.85em;display:flex;align-items:center;gap:6px">
            <i class="ri-mail-line" style="font-size:.95rem;flex-shrink:0"></i>${user.email ?? '-'}
          </p>
          <p style="margin:0 0 5px;color:#555;font-size:.85em;display:flex;align-items:center;gap:6px">
            <i class="ri-phone-line" style="font-size:.95rem;flex-shrink:0"></i>${user.phone_number ?? '-'}
          </p>
          <p style="margin:0 0 5px;color:#555;font-size:.85em;display:flex;align-items:center;gap:6px">
            <i class="ri-time-line" style="font-size:.95rem;flex-shrink:0"></i>${triggered}
          </p>
          <p style="margin:0;font-size:.85em;display:flex;align-items:center;gap:6px">
            <i class="ri-battery-2-charge-line" style="font-size:.95rem;flex-shrink:0;color:${batteryColor}"></i>
            <strong style="color:${batteryColor}">${batteryLevel !== null ? batteryLevel + '%' : 'N/A'}</strong>
          </p>
        </div>
      </div>`;
  }

  ngOnDestroy(): void {
    this.socket?.close();
    this.socket = null;

    this.clusterGroup.clearLayers();
    this.activeAlerts.clear();
    this.userToAlertId.clear();

    this.map?.remove();
    this.map = null;
  }
}
