import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Ad, Price } from '../interfaces/ad';
import { map, Observable } from 'rxjs';
import { PortalType } from '../enums/portalType';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdService {

    private http = inject(HttpClient);
    private baseUrl = `http://${environment.DbHost}:${environment.DbPort}/${environment.DbName}/`;
    private headers = new HttpHeaders({
        'Authorization': `Basic ${btoa(`${environment.DbUser}:${environment.DbPassword}`)}`,
        'Content-Type': 'application/json'
    });

    data = signal<number[]>([]);

    public getAds(): Observable<Ad[]> {

        const url = this.baseUrl + '_all_docs?include_docs=true';
        return this.http.get<Ad[]>(url, { headers: this.headers }).pipe(
            map((response: any) => response.rows.map((row: any) => {
                return {
                    PortalId: row.doc.Id,
                    Portal: row.doc.Portal,
                    Property: row.doc.Property,
                    Id: row.doc._id,
                    Direction: row.doc.Direction,
                    Price: row.doc.Price,
                    PriceAverage: this.calculateAverage(row.doc.Price),
                    CreationDate: this.getOldestPriceDate(row.doc.Price),
                    LastUpdateDate: this.getLastUpdateDate(row.doc.Price)
                }
            }))
        );

    }

    private calculateAverage(prices: Price[]): number {

        const values: number[] =
            prices
                .map(p => p.value)
                .filter(v => v !== null);

        if (values.length === 0)
            return 0;

        return values.reduce((a, b) => a + b) / values.length;

    }

    private getOldestPriceDate(prices: Price[]): Date | null {

        if (!prices || prices.length === 0)
            return null;

        return prices.reduce((a, b) => a.date < b.date ? a : b).date;

    }

    private getLastUpdateDate(prices: Price[]): Date | null {

        if (!prices || prices.length === 0)
            return null;

        return prices.reduce((a, b) => a.date > b.date ? a : b).date;

    }


    // constructor() {
    //     this.loadInitialData();
    // }

    // async loadInitialData() {
    //     try {
    //         const ads = await this.getAds();
    //         if (ads.length > 0) {
    //             // For demonstration, use the price history of the first ad
    //             const prices = ads[0].Price.map(p => p.value).filter(v => v !== null) as number[];
    //             this.data.set(prices);
    //         }
    //     } catch (error) {
    //         console.error('Error loading ads from CouchDB', error);
    //         // Fallback to mock data if needed
    //         this.data.set([10, 50, 30, 70, 45, 90]);
    //     }
    // }

    // async getAds(): Promise<Ad[]> {
    //     const response = await firstValueFrom(
    //         this.http.get<{ rows: { doc: Ad }[] }>(this.baseUrl)
    //     );
    //     return response.rows.map(row => row.doc);
    // }

}