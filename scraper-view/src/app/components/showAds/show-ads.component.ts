import { Component, inject, signal } from '@angular/core';
import { AdService } from '../../services/ad.service';
import { Ad } from '../../interfaces/ad';
import { LineChartComponent } from '../lineChart/line-chart.component';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ExternalLink, ChevronsUpDown, ChevronDown, ChevronUp, LucideAngularModule } from 'lucide-angular';
import { AdsHeader } from '../../interfaces/adsHeader';

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
  public readonly ChevronsUpDownIcon = ChevronsUpDown;
  public readonly ChevronDownIcon = ChevronDown;
  public readonly ChevronUpIcon = ChevronUp;

  public pagedAds = signal<Ad[]>([]);
  public selectedAds = signal<Ad[]>([]);
  public totalAds = signal(0);
  public totalPages = signal(0);
  public currentPage = signal(0);
  public header = signal<AdsHeader[]>([
    { Name: 'Tipo', Sort: '', AdName: 'Property' },
    { Name: 'Dirección', Sort: '', AdName: 'Direction' },
    { Name: 'Portal', Sort: '', AdName: 'Portal.Type' },
    { Name: 'Precio promedio', Sort: '', AdName: 'PriceAverage' },
    { Name: 'Fecha creación', Sort: 'desc', AdName: 'CreationDate' },
    { Name: 'Fecha última actualización', Sort: '', AdName: 'LastUpdateDate' },
  ]);

  private allAds: Ad[] = [];

  constructor() {

    this.adsService.getAds().subscribe((ads) => {

      this.allAds = ads;
      this.sortAds('CreationDate', 'desc');
      this.currentPage.set(0);
      this.totalPages.set(Math.ceil(this.allAds.length / 5));
      this.totalAds.set(this.allAds.length);
      this.refreshAds();

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

  sortAds(adName: string, sortBy: 'asc' | 'desc') {

    const sortMultiplier = sortBy === 'asc' ? 1 : -1;

    this.header.set(this.header().map(h => {

      if (h.AdName === adName)
        h.Sort = sortBy;
      else
        h.Sort = '';

      return h;

    }));

    this.allAds = this.allAds.sort((a, b) => {

      const valueA = this.getNestedValue(a, adName);
      const valueB = this.getNestedValue(b, adName);

      if (typeof valueA === 'string' && typeof valueB === 'string')
        return valueA.localeCompare(valueB) * sortMultiplier;

      if (typeof valueA === 'number' && typeof valueB === 'number')
        return (valueA - valueB) * sortMultiplier;

      if (valueA instanceof Date && valueB instanceof Date)
        return (valueA.getTime() - valueB.getTime()) * sortMultiplier;

      return 0;

    });

    this.refreshAds();

  }

  private getNestedValue(obj: any, path: string): any {

    return path.split('.').reduce((acc, part) => acc && acc[part], obj);

  }

  private refreshAds() {

    this.changePage(this.currentPage());

  }

}

