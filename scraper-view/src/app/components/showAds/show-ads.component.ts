import { Component, inject, signal } from '@angular/core';
import { AdService } from '../../services/ad.service';
import { Price } from '../../interfaces/price';
import { LineChartComponent } from '../lineChart/line-chart.component';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ExternalLink, ChevronsUpDown, ChevronDown, ChevronUp, LucideAngularModule } from 'lucide-angular';
import { AdsHeader } from '../../interfaces/adsHeader';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PortalType } from '../../enums/portalType';
import { PropertyType } from '../../enums/propertyType';
import { Ad } from '../../models/ad.model';
import { Dataset, LineChartData } from '../../interfaces/lineChartData';

@Component({
  selector: 'show-ads',
  imports: [
    LineChartComponent,
    CurrencyPipe,
    DatePipe,
    CommonModule,
    LucideAngularModule,
    ReactiveFormsModule
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
  public lineChartData = signal<LineChartData>({
    labels: [],
    datasets: []
  });
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
  public searchControl = new FormControl('');

  private allAds: Ad[] = [];
  private filteredAds: Ad[] = [];
  private selectedAds: Ad[] = [];

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        this.searchAds(value);
        this.refreshPagination();
        this.refreshAds();
      });
  }

  constructor() {

    this.adsService.getAds().subscribe((ads) => {

      this.allAds = ads;
      this.filteredAds = ads;
      this.sortAds('CreationDate', 'desc');
      this.refreshPagination();
      this.refreshAds();

      const av = this.calculateAveragePricePerDate(this.filteredAds);
      this.selectedAds.push(av);
      this.lineChartData.set(this.convertAdToLineChartData(this.selectedAds));

    });

  }

  getRange(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  changePage(page: number) {
    if (page < 0 || page >= this.totalPages()) return;

    this.currentPage.set(page);
    this.pagedAds.set(this.filteredAds.slice(page * 5, (page + 1) * 5));
  }

  toggleSelectedAd(newAd: Ad) {
    if (this.selectedAds.includes(newAd)) {
      this.selectedAds = this.selectedAds.filter(ad => ad !== newAd);
    } else {
      this.selectedAds.push(newAd);
    }

    this.lineChartData.set(this.convertAdToLineChartData(this.selectedAds));

  }

  adIsSelected(ad: Ad): boolean {
    return this.selectedAds.includes(ad);
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

    this.filteredAds = this.filteredAds.sort((a, b) => {

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

  private refreshPagination() {

    this.currentPage.set(0);
    this.totalPages.set(Math.ceil(this.filteredAds.length / 5));
    this.totalAds.set(this.filteredAds.length);

  }

  private searchAds(value: string | null) {

    this.filteredAds = this.allAds.filter(ad =>
      [ad.Property, ad.Direction, ad.Portal.Type, ad.PriceAverage.toString(), ad.CreationDate.toString(), ad.LastUpdateDate.toString()]
        .some(field => field.toLowerCase().includes(value!.toLowerCase()))
    );

  }

  private calculateAveragePricePerDate(ads: Ad[]): Ad {

    const pricesPerDate =
      Object.entries(
        ads
          .flatMap(ad => ad.Price)
          .reduce((acc: Record<string, number[]>, price) => {

            const dateKey = price.date.toISOString().replace(/\.\d{3}Z$/, '');

            if (price.value !== null) {

              if (!acc[dateKey])
                acc[dateKey] = [];

              acc[dateKey].push(price.value);

            }

            return acc;

          }, {} as Record<string, number[]>)
      )
        .map(([dateString, prices]: [string, number[]]): Price => {

          return {
            date: new Date(dateString),
            value: prices.reduce((acc, price) => acc + price, 0) / prices.length,
          }

        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    return new Ad({
      PortalId: '',
      Portal: {
        Type: PortalType.NOT_DEFINED,
        Url: ''
      },
      Property: PropertyType.NOT_DEFINED,
      Id: '',
      Direction: 'Media',
      Price: pricesPerDate
    });

  }

  private convertAdToLineChartData(selectedAds: Ad[]): LineChartData {

    const dateFormatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };

    const dateMap = new Map<string, Date>();
    selectedAds.flatMap(ad =>
      ad.Price.map(price => price.date)
    ).forEach(date => {
      const dateStr = date.toLocaleDateString('es-ES', dateFormatOptions);
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, date);
      }
    });

    const labels: string[] = Array.from(dateMap.entries())
      .sort((a, b) => a[1].getTime() - b[1].getTime())
      .map(entry => entry[0]);

    const datasets: Dataset[] = Array.from(
      selectedAds.map((ad, index) => {
        const priceMap = new Map<string, number>();
        ad.Price.forEach(price => {
          const dateStr = price.date.toLocaleDateString('es-ES', dateFormatOptions);
          priceMap.set(dateStr, price.value || 0);
        });

        const data = labels.map(label => priceMap.get(label) || 0);

        return {
          data,
          label: ad.Direction || 'Unknown',
          id: index === 0 ? '-1' : ad.Id,
          fill: false,
          tension: 0.3,
          spanGaps: true,
          hidden: index === 0
        }
      })
    );

    return {
      labels,
      datasets
    };

  }

}
