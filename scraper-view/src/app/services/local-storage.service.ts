import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    private platformId = inject(PLATFORM_ID);

    private get isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    setItem(key: string, value: any): void {
        if (this.isBrowser) {
            try {
                const serializedValue = JSON.stringify(value);
                localStorage.setItem(key, serializedValue);
            } catch (e) {
                console.error('Error guardando en localStorage', e);
            }
        }
    }

    getItem<T>(key: string): T | null {
        if (!this.isBrowser) return null;

        const item = localStorage.getItem(key);
        if (!item) return null;

        try {
            return JSON.parse(item) as T;
        } catch (e) {
            console.error('Error parseando JSON de localStorage', e);
            return null;
        }
    }

    removeItem(key: string): void {
        if (this.isBrowser) {
            localStorage.removeItem(key);
        }
    }

    clear(): void {
        if (this.isBrowser) {
            localStorage.clear();
        }
    }

}
