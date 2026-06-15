import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  imports: [],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
})
export class PrivacyPolicyComponent implements OnInit {
  ngOnInit(): void {
    document.documentElement.setAttribute('data-preloader', 'disable');

    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
      preloader.style.display = 'none';
    }
  }
}
