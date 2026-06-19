import { Component, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { environment } from 'src/environments/environment';
import { GlobalComponent } from 'src/app/global-component';
import * as L from 'leaflet';
import Supercluster from 'supercluster';

interface AlertData {
  userId: number;
  lat: number;
  lng: number;
  user: any;
  batteryLevel: number | null;
  triggeredAt: string | null;
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
  private sc = new Supercluster({ radius: 60, maxZoom: 19 });
  private markersLayer!: L.LayerGroup;
  private socket: WebSocket | null = null;
  private token = localStorage.getItem('token') ?? '';

  private alertData = new Map<number, AlertData>();
  private userToAlertId = new Map<number, number>();
  private renderedMarkers = new Map<number, L.Marker>();
  private selectedAlertId: number | null = null;
  private mapAnimating = false;
  private spiderState: { clusterId: number; lat: number; lng: number; leaves: any[] } | null = null;

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

    this.markersLayer = L.layerGroup().addTo(this.map);

    // Re-render on pan/zoom — spider state is preserved across pans, cleared on zoom or map click
    this.map.on('moveend zoomend', () => this.renderClusters());
    // Only clear spider on user-initiated zoom — mapAnimating guards against programmatic flyTo
    this.map.on('zoomstart',       () => { if (!this.mapAnimating) this.spiderState = null; });
    this.map.on('click',           () => { if (this.spiderState) { this.spiderState = null; this.renderClusters(); } });

    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  // ── WebSocket ────────────────────────────────────────────────────────────────

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

  // ── Event handling ───────────────────────────────────────────────────────────

  private handleEvent(payload: any): void {
    switch (payload.type) {
      case 'sos_active_list':    this.onActiveList(payload);      break;
      case 'sos.triggered':      this.handleIncomingAlert(payload); break;
      case 'location.update.sos': this.onLocationUpdate(payload); break;
      case 'sos.resolved.admin': this.onSosResolved(payload);     break;
      default: console.warn('[SOS Map] Unhandled event:', payload.type);
    }
  }

  private onActiveList(payload: any): void {
    if (!this.map || !Array.isArray(payload.data) || payload.data.length === 0) return;

    payload.data.forEach((item: any) => {
      const sosAlertId: number = item.id;
      if (this.alertData.has(sosAlertId)) return;

      const loc  = item.user_location;
      const user = loc.user ?? {};
      this.addAlert(sosAlertId, {
        userId:       Number(user.id),
        lat:          Number(loc.latitude),
        lng:          Number(loc.longitude),
        user,
        batteryLevel: loc.battery_level ?? null,
        triggeredAt:  item.triggered_at ?? null,
      });
    });

    this.activeAlertCount = this.alertData.size;
    this.rebuildIndex();
    this.renderClusters();
    this.fitBoundsToAlerts();
  }

  handleIncomingAlert(payload: any): void {
    if (!this.map) return;

    const data = payload.data;
    const loc  = data.user_location;
    const user = loc.user ?? {};
    const sosAlertId = Number(data.id);

    if (this.alertData.has(sosAlertId)) this.removeAlert(sosAlertId);

    this.addAlert(sosAlertId, {
      userId:       Number(user.id),
      lat:          Number(loc.latitude),
      lng:          Number(loc.longitude),
      user,
      batteryLevel: data.battery_level ?? loc.battery_level ?? null,
      triggeredAt:  data.triggered_at ?? null,
    });

    this.activeAlertCount = this.alertData.size;
    this.rebuildIndex();
    this.renderClusters();

    const d = this.alertData.get(sosAlertId)!;
    this.map.flyTo([d.lat, d.lng], 15, { animate: true, duration: 1.2 });
  }

  private onLocationUpdate(payload: any): void {
    const data   = payload.data;
    const userId = Number(data.user.id);
    const lat    = Number(data.latitude);
    const lng    = Number(data.longitude);

    const sosAlertId = this.userToAlertId.get(userId);
    if (sosAlertId === undefined) return;

    const alertDatum = this.alertData.get(sosAlertId);
    if (!alertDatum) return;

    alertDatum.lat = lat;
    alertDatum.lng = lng;

    this.rebuildIndex();

    // Animate the marker in-place if currently rendered as an individual pin
    const marker = this.renderedMarkers.get(sosAlertId);
    if (marker) this.animateLatLng(marker, lat, lng);

    if (sosAlertId === this.selectedAlertId && this.map && !this.mapAnimating) {
      this.map.panTo([lat, lng], { animate: true, duration: 0.5 });
    }
  }

  private onSosResolved(payload: any): void {
    const sosAlertId = Number(payload.sos_alert_id);
    const d = this.alertData.get(sosAlertId);
    if (!d) return;

    const { lat, lng } = d;
    this.removeAlert(sosAlertId);
    this.rebuildIndex();
    this.renderClusters();
    this.flyToNearest(lat, lng);
  }

  // ── Data management ──────────────────────────────────────────────────────────

  private addAlert(sosAlertId: number, data: AlertData): void {
    this.alertData.set(sosAlertId, data);
    this.userToAlertId.set(data.userId, sosAlertId);
  }

  private removeAlert(sosAlertId: number): void {
    const d = this.alertData.get(sosAlertId);
    if (!d) return;
    this.userToAlertId.delete(d.userId);
    this.alertData.delete(sosAlertId);
    this.activeAlertCount = this.alertData.size;
    if (sosAlertId === this.selectedAlertId) this.selectedAlertId = null;
  }

  private rebuildIndex(): void {
    const points: Supercluster.PointFeature<{ alertId: number }>[] = [];
    this.alertData.forEach((d, alertId) => {
      points.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [d.lng, d.lat] },
        properties: { alertId },
      });
    });
    this.sc.load(points);
  }

  // ── Cluster rendering ────────────────────────────────────────────────────────

  private renderClusters(): void {
    if (!this.map) return;

    this.markersLayer.clearLayers();
    this.renderedMarkers.clear();

    if (this.alertData.size === 0) return;

    const bounds = this.map.getBounds();
    const zoom   = Math.round(this.map.getZoom());
    const bbox: [number, number, number, number] = [
      bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth(),
    ];

    const clusters = this.sc.getClusters(bbox, zoom);

    for (const feature of clusters) {
      const [lng, lat] = feature.geometry.coordinates;

      if (feature.properties['cluster']) {
        const clusterId = feature.properties['cluster_id'] as number;

        // If this is the active spider cluster, render spread pins instead of the badge
        if (this.spiderState?.clusterId === clusterId) {
          this.renderSpider(this.spiderState);
          continue;
        }

        const count  = feature.properties['point_count'] as number;
        const marker = L.marker([lat, lng], { icon: this.createClusterIcon(count) });
        marker.on('click', () => this.onClusterClick(clusterId, lat, lng));
        this.markersLayer.addLayer(marker);
      } else {
        this.addPinMarker(feature.properties['alertId'] as number, lat, lng);
      }
    }
  }

  private renderSpider(state: NonNullable<typeof this.spiderState>): void {
    const n      = state.leaves.length;
    const radius = 0.00012;

    // Centre dot
    this.markersLayer.addLayer(
      L.circleMarker([state.lat, state.lng], {
        radius: 5, color: '#dc3545', fillColor: '#dc3545',
        fillOpacity: 1, weight: 2,
      })
    );

    state.leaves.forEach((leaf: any, i: number) => {
      const angle    = (2 * Math.PI * i) / n - Math.PI / 2;
      const spreadLat = state.lat + radius * Math.sin(angle);
      const spreadLng = state.lng + radius * Math.cos(angle);

      // Leg line from centre to pin
      this.markersLayer.addLayer(
        L.polyline([[state.lat, state.lng], [spreadLat, spreadLng]], {
          color: '#dc3545', weight: 1.5, opacity: 0.7, dashArray: '4 3',
        })
      );

      this.addPinMarker(leaf.properties['alertId'] as number, spreadLat, spreadLng);
    });
  }

  private addPinMarker(alertId: number, lat: number, lng: number): void {
    const d = this.alertData.get(alertId);
    if (!d) return;
    const marker = L.marker([lat, lng], { icon: this.createSosIcon(d.user) });
    marker.bindPopup(this.buildPopupHtml(d.user, d.batteryLevel, d.triggeredAt), { autoPan: false });
    marker.on('click', () => this.onMarkerClick(alertId, marker));
    this.markersLayer.addLayer(marker);
    this.renderedMarkers.set(alertId, marker);
  }

  private onClusterClick(clusterId: number, lat: number, lng: number): void {
    if (!this.map) return;
    const expansionZoom = this.sc.getClusterExpansionZoom(clusterId);

    // If can't zoom further to separate → spider
    if (expansionZoom > 19 || Math.round(this.map.getZoom()) >= expansionZoom) {
      this.spiderfyCluster(clusterId, lat, lng);
      return;
    }

    this.spiderState = null;
    this.mapAnimating = true;
    this.map.flyTo([lat, lng], Math.min(expansionZoom, 19), { animate: true, duration: 0.8 });
    this.map.once('moveend', () => (this.mapAnimating = false));
  }

  private spiderfyCluster(clusterId: number, centerLat: number, centerLng: number): void {
    if (!this.map) return;
    const leaves = this.sc.getLeaves(clusterId, Infinity);
    if (leaves.length === 0) return;

    // Store state — renderClusters will use it to draw spread pins on every subsequent render
    this.spiderState = { clusterId, lat: centerLat, lng: centerLng, leaves };

    if (Math.round(this.map.getZoom()) < 19) {
      this.mapAnimating = true;
      this.map.flyTo([centerLat, centerLng], 19, { animate: true, duration: 0.8 });
      this.map.once('moveend', () => (this.mapAnimating = false));
      // renderClusters fires automatically from the 'moveend' listener in initMap
    } else {
      this.renderClusters();
    }
  }

  private onMarkerClick(alertId: number, marker: L.Marker): void {
    if (!this.map) return;
    this.selectedAlertId = alertId;

    // In spider view: open popup immediately — no flyTo (which would cause zoomstart + re-cluster)
    if (this.spiderState) {
      marker.openPopup();
      return;
    }

    marker.closePopup();
    const latlng     = marker.getLatLng();
    const targetZoom = Math.max(this.map.getZoom(), 17);

    this.mapAnimating = true;
    this.map.flyTo(latlng, targetZoom, { animate: true, duration: 0.8 });
    // moveend fires renderClusters first (registered earlier), then this callback
    this.map.once('moveend', () => {
      this.mapAnimating = false;
      this.renderedMarkers.get(alertId)?.openPopup();
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private fitBoundsToAlerts(): void {
    if (!this.map || this.alertData.size === 0) return;

    if (this.alertData.size === 1) {
      const d = this.alertData.values().next().value as AlertData;
      this.map.flyTo([d.lat, d.lng], 15, { animate: true, duration: 1.0 });
      return;
    }

    const latLngs: L.LatLng[] = [];
    this.alertData.forEach(d => latLngs.push(L.latLng(d.lat, d.lng)));
    this.map.fitBounds(L.latLngBounds(latLngs).pad(0.25), { animate: true, maxZoom: 15 });
  }

  private flyToNearest(fromLat: number, fromLng: number): void {
    if (!this.map || this.alertData.size === 0) return;

    let nearestData: AlertData | null = null;
    let minDist = Infinity;
    this.alertData.forEach(d => {
      const dist = Math.hypot(d.lat - fromLat, d.lng - fromLng);
      if (dist < minDist) { minDist = dist; nearestData = d; }
    });

    if (nearestData) {
      const d = nearestData as AlertData;
      this.map.flyTo([d.lat, d.lng], this.map.getZoom(), { animate: true, duration: 1.0 });
    }
  }

  private animateLatLng(marker: L.Marker, toLat: number, toLng: number, durationMs = 700): void {
    const from    = marker.getLatLng();
    const fromLat = from.lat;
    const fromLng = from.lng;
    const t0      = performance.now();

    const tick = (now: number) => {
      const p    = Math.min((now - t0) / durationMs, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      marker.setLatLng([fromLat + (toLat - fromLat) * ease, fromLng + (toLng - fromLng) * ease]);
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  private createClusterIcon(count: number): L.DivIcon {
    return L.divIcon({
      html:      `<div class="sos-cluster"><span>${count}</span></div>`,
      className: '',
      iconSize:  [44, 44],
      iconAnchor: [22, 22],
    });
  }

  private createSosIcon(user: any): L.DivIcon {
    const initials = this.getInitials(user?.full_name);
    const bg       = user?.profile_picture ? 'transparent' : 'var(--bs-primary, #405189)';
    const inner    = user?.profile_picture
      ? `<img src="${user.profile_picture}"
             style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
             onerror="this.parentElement.innerHTML='<span style=line-height:40px>${initials}</span>'" />`
      : `<span style="line-height:40px">${initials}</span>`;

    return L.divIcon({
      html:        `<div class="sos-pin" style="background:${bg}">${inner}</div>`,
      className:   '',
      iconSize:    [40, 40],
      iconAnchor:  [20, 20],
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

  private buildPopupHtml(user: any, batteryLevel: number | null, triggeredAt: string | null): string {
    const batteryColor =
      batteryLevel === null ? '#6c757d'
        : batteryLevel > 30  ? '#28a745'
        : batteryLevel > 15  ? '#fd7e14'
        :                      '#dc3545';
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
    this.markersLayer?.clearLayers();
    this.alertData.clear();
    this.userToAlertId.clear();
    this.renderedMarkers.clear();
    this.map?.remove();
    this.map = null;
  }
}
