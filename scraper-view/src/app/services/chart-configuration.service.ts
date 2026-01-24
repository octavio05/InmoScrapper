import { Injectable, inject } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { ChartConfiguration } from '../interfaces/chartConfiguration';

@Injectable({
    providedIn: 'root'
})
export class ChartConfigurationService {

    private localStorageService = inject(LocalStorageService);

    constructor() { }

    updateVisibility(id: string, hidden: boolean): void {

        const configuration = this.localStorageService.getItem<ChartConfiguration[]>('chartConfiguration') || [];
        const index = configuration.findIndex(c => c.id === id);

        if (index === -1)
            configuration.push({ id, hidden, selected: true });
        else
            configuration[index].hidden = hidden;

        this.localStorageService.setItem('chartConfiguration', configuration);

    }

    updateSelection(id: string, selected: boolean): void {

        const configuration = this.localStorageService.getItem<ChartConfiguration[]>('chartConfiguration') || [];
        const index = configuration.findIndex(c => c.id === id);

        if (index === -1)
            configuration.push({ id, hidden: false, selected });
        else
            configuration[index].selected = selected;

        this.localStorageService.setItem('chartConfiguration', configuration);

    }

    get(): ChartConfiguration[] {

        return this.localStorageService.getItem<ChartConfiguration[]>('chartConfiguration') || [];

    }
}
