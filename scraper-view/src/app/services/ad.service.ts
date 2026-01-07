import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { AdDto } from '../dtos/adDto';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ad } from '../models/ad.model';

@Injectable({ providedIn: 'root' })
export class AdService {

    private http = inject(HttpClient);
    private baseUrl = environment.Environment === 'local' ?
        `http://${environment.DbHost}:${environment.DbPort}/${environment.DbName}/` :
        `/couchdb/${environment.DbName}/`;
    private headers = new HttpHeaders({
        'Authorization': `Basic ${btoa(`${environment.DbUser}:${environment.DbPassword}`)}`,
        'Content-Type': 'application/json'
    });

    data = signal<number[]>([]);

    public getAds(): Observable<Ad[]> {

        const url = this.baseUrl + '_all_docs?include_docs=true';

        return this.http.get<AdDto[]>(url, { headers: this.headers }).pipe(
            map((response: any) => response.rows.map((row: any) => {
                return new Ad({
                    PortalId: row.Id,
                    Portal: row.doc.Portal,
                    Property: row.doc.Property,
                    Id: row.doc._id,
                    Direction: row.doc.Direction,
                    Price: row.doc.Price.map((p: any) => ({ ...p, date: new Date(p.date) })),
                });
            }))
        );

    }

}