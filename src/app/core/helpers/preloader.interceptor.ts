import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class PreloaderInterceptor implements HttpInterceptor {
  private getPreloader(): HTMLElement | null {
    return document.getElementById('preloader');
  }

  private showPreloader(): void {
    const preloader = this.getPreloader();
    if (preloader) {
      document.documentElement.setAttribute('data-preloader', 'enable');
      preloader.style.display = 'block';
      preloader.style.opacity = '1';
      preloader.style.visibility = 'visible';
    }
  }

  private hidePreloader(): void {
    const preloader = this.getPreloader();
    if (preloader) {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 400);
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (document.documentElement.getAttribute('data-preloader') !== 'enable') {
      return next.handle(req);
    }

    this.showPreloader();
    return next.handle(req).pipe(finalize(() => {
      this.hidePreloader();
    }));
  }
}
