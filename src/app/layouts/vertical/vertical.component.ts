import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-vertical',
  templateUrl: './vertical.component.html',
  styleUrls: ['./vertical.component.scss'],
  standalone: false
})
export class VerticalComponent implements OnDestroy {

  isCondensed = false;
  dataloader: any;
  isLoading: any;
  private destroy$ = new Subject<void>();
  private resizeListener!: () => void;

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.router.events.pipe(
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      if (document.documentElement.getAttribute('data-preloader') == 'enable') {
        if (event instanceof NavigationEnd) {
          // Update the attribute state based on the current route or any other conditions
          if (event.url !== '/disabled-route') {
            (document.getElementById("preloader") as HTMLElement).style.opacity = "1";
            (document.getElementById("preloader") as HTMLElement).style.visibility = "";
            setTimeout(() => {
              (document.getElementById("preloader") as HTMLElement).style.opacity = "0";
              (document.getElementById("preloader") as HTMLElement).style.visibility = "hidden";
            }, 1000);
          } else {
            (document.getElementById("preloader") as HTMLElement).style.opacity = "0";
            (document.getElementById("preloader") as HTMLElement).style.visibility = "hidden";
          }
        }
      }
    });

    this.resizeListener = () => {
      if (document.documentElement.clientWidth <= 767) {
        document.documentElement.setAttribute('data-sidebar-size', '');
        document.querySelector('.hamburger-icon')?.classList.add('open')
      }
      else if (document.documentElement.clientWidth <= 1024) {
        document.documentElement.setAttribute('data-sidebar-size', 'sm');
        document.querySelector('.hamburger-icon')?.classList.add('open')
        document.body.classList.remove('vertical-sidebar-enable');
      }
      else if (document.documentElement.clientWidth >= 1024) {
        document.documentElement.setAttribute('data-sidebar-size', 'lg');
        document.querySelector('.hamburger-icon')?.classList.remove('open');
        document.body.classList.remove('vertical-sidebar-enable');
      }
    };
    window.addEventListener('resize', this.resizeListener);

  }

  /**
  * On mobile toggle button clicked
  */
  onToggleMobileMenu() {
    const currentSIdebarSize = document.documentElement.getAttribute("data-sidebar-size");
    if (document.documentElement.clientWidth >= 767) {
      if (currentSIdebarSize == null) {
        (document.documentElement.getAttribute('data-sidebar-size') == null || document.documentElement.getAttribute('data-sidebar-size') == "lg") ? document.documentElement.setAttribute('data-sidebar-size', 'sm') : document.documentElement.setAttribute('data-sidebar-size', 'lg')
      } else if (currentSIdebarSize == "md") {
        (document.documentElement.getAttribute('data-sidebar-size') == "md") ? document.documentElement.setAttribute('data-sidebar-size', 'sm') : document.documentElement.setAttribute('data-sidebar-size', 'md')
      } else {
        (document.documentElement.getAttribute('data-sidebar-size') == "sm") ? document.documentElement.setAttribute('data-sidebar-size', 'lg') : document.documentElement.setAttribute('data-sidebar-size', 'sm')
      }
    }

    if (document.documentElement.clientWidth <= 767) {
      document.body.classList.add('vertical-sidebar-enable');
    }
    this.isCondensed = !this.isCondensed;
  }

  /**
   * on settings button clicked from topbar
   */
  onSettingsButtonClicked() {
    document.querySelector('.custom-offcanvas')?.classList.toggle('show')
    document.getElementById('backdrop')?.classList.toggle('show')
    // document.body.classList.toggle('right-bar-enabled');
    // const rightBar = document.getElementById('theme-settings-offcanvas');
    // if (rightBar != null) {
    //   rightBar.classList.toggle('show');
    //   rightBar.setAttribute('style', "visibility: visible;");

    // }
  }

  ngOnDestroy(): void {
    // Clean up resize listener
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    // Complete destroy subject
    this.destroy$.next();
    this.destroy$.complete();
  }

}
