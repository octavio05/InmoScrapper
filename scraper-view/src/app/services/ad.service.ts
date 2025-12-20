import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdService {

    data = signal([10, 50, 30, 70, 45, 90]);

}