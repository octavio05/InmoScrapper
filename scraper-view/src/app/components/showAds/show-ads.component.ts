import { Component, inject, signal } from '@angular/core';
import { AdService } from '../../services/ad.service';
import { Ad } from '../../interfaces/ad';
import { LineChartComponent } from '../lineChart/line-chart.component';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ExternalLink, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'show-ads',
  imports: [
    LineChartComponent,
    CurrencyPipe,
    DatePipe,
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './show-ads.component.html',
  styleUrl: './show-ads.component.css',
})
export class ShowAdsComponent {

  private adsService = inject(AdService);

  public readonly ExternalLinkIcon = ExternalLink;

  public pagedAds = signal<Ad[]>([]);
  public selectedAds = signal<Ad[]>([]);
  public totalAds = signal(0);
  public totalPages = signal(0);
  public currentPage = signal(0);
  private allAds: Ad[] = [];

  constructor() {

    this.adsService.getAds().subscribe((ads) => {
      this.allAds = ads;
      this.pagedAds.set(this.allAds.slice(0, 5));
      this.totalPages.set(Math.ceil(this.allAds.length / 5));
      this.currentPage.set(0);
      this.totalAds.set(this.allAds.length);
    });

  }

  getRange(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  changePage(page: number) {
    if (page < 0 || page >= this.totalPages()) return;

    this.currentPage.set(page);
    this.pagedAds.set(this.allAds.slice(page * 5, (page + 1) * 5));
  }

  toggleSelectedAd(newAd: Ad) {
    if (this.selectedAds().includes(newAd)) {
      this.selectedAds.set(this.selectedAds().filter(ad => ad !== newAd));
    } else {
      this.selectedAds.set([...this.selectedAds(), newAd]);
    }
  }

  adIsSelected(ad: Ad): boolean {
    return this.selectedAds().includes(ad);
  }

}

