import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule, PdfViewerModule],
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.scss']
})
export class TermsOfServiceComponent implements OnInit {

  pdfUrl: string = 'assets/docs/Angel_Protect_Terms_of_Service_EN.pdf';

  loading = true;
  error = false;

  ngOnInit(): void {
    this.hidePreloader();
  }

  private hidePreloader(): void {
    document.documentElement.setAttribute('data-preloader', 'disable');

    const preloader = document.getElementById('preloader');

    if (preloader) {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
      preloader.style.display = 'none';
    }
  }

  onPdfLoaded(): void {
    this.loading = false;
    this.error = false;
  }

  onPdfError(error: any): void {
    console.error('PDF Load Error:', error);

    this.loading = false;
    this.error = true;
  }
}