import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-authlayout',
  templateUrl: './authlayout.component.html',
  styleUrls: ['./authlayout.component.scss'],
  standalone: false
})
export class AuthlayoutComponent implements OnDestroy {
  theme: any;
  private destroy$ = new Subject<void>();
  private preloaderTimeoutId?: ReturnType<typeof setTimeout>;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.theme = document.documentElement.getAttribute('data-theme')
    if (this.theme) {
      document.documentElement.setAttribute('data-theme', this.theme);
    } else {
      document.documentElement.setAttribute('data-theme', 'default');
    }
    document.documentElement.setAttribute('data-layout', 'vertical');
    document.documentElement.setAttribute('data-sidebar', 'dark');
    document.documentElement.setAttribute('data-bs-theme', 'light');
    document.documentElement.setAttribute('data-layout-width', 'fluid');
    document.documentElement.setAttribute('data-sidebar-image', 'none');
    document.documentElement.setAttribute('data-layout-position', 'fixed');
    document.documentElement.setAttribute('data-layout-style', 'default');
    document.documentElement.setAttribute('data-topbar', 'light');
    document.documentElement.setAttribute('data-preloader', 'enable');
    this.showAndHidePreloader();

    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (document.documentElement.getAttribute('data-preloader') === 'enable') {
        this.showAndHidePreloader();
      }
    });

    window.addEventListener('resize', function () {
      if (document.documentElement.clientWidth <= 767) {
        document.documentElement.setAttribute('data-sidebar-size', '');
        document.querySelector('.hamburger-icon')?.classList.add('open')
      }
      else if (document.documentElement.clientWidth <= 1024) {
        document.documentElement.setAttribute('data-sidebar-size', 'sm');
        document.querySelector('.hamburger-icon')?.classList.add('open')
      }
      else if (document.documentElement.clientWidth >= 1024) {
        document.documentElement.setAttribute('data-sidebar-size', 'lg');
        document.querySelector('.hamburger-icon')?.classList.remove('open')
      }
    })

  }

  private showAndHidePreloader(): void {
    const preloader = document.getElementById('preloader') as HTMLElement | null;
    if (!preloader) {
      return;
    }

    if (this.preloaderTimeoutId) {
      clearTimeout(this.preloaderTimeoutId);
    }

    preloader.style.display = 'block';
    preloader.style.opacity = '1';
    preloader.style.visibility = 'visible';

    this.preloaderTimeoutId = setTimeout(() => {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
    }, 800);
  }

  ngOnDestroy(): void {
    if (this.preloaderTimeoutId) {
      clearTimeout(this.preloaderTimeoutId);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
