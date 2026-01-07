import { PortalType } from "../enums/portalType";
import { Price } from "../interfaces/price";
import { Portal } from "../interfaces/portal";

export class Ad {

    public PortalId: string = '';
    public Portal: Portal = { Type: PortalType.NOT_DEFINED, Url: '' };
    public Property: string = '';
    public Id: string = '';
    public Direction: string = '';
    public Price: Price[] = [];

    constructor(init?: Partial<Pick<Ad, 'PortalId' | 'Portal' | 'Property' | 'Id' | 'Direction' | 'Price'>>) {
        Object.assign(this, init);
    }

    private _priceAverage: number | null = null;
    private _creationDate: Date | null = null;
    private _lastUpdateDate: Date | null = null;

    get PriceAverage(): number {

        if (this._priceAverage === null)
            this._priceAverage = this.calculateAverage();

        return this._priceAverage;
    }

    get CreationDate(): Date {

        if (this._creationDate === null)
            this._creationDate = this.getOldestPriceDate() || new Date();

        return this._creationDate;
    }

    get LastUpdateDate(): Date {

        if (this._lastUpdateDate === null)
            this._lastUpdateDate = this.getLastUpdateDate() || new Date();

        return this._lastUpdateDate;
    }

    private calculateAverage(): number {

        return this.Price.reduce((a, b) => a + (b.value || 0), 0) / this.Price.length;

    }

    private getOldestPriceDate(): Date | null {

        if (!this.Price || this.Price.length === 0)
            return null;

        return new Date(this.Price.reduce((a, b) => a.date < b.date ? a : b).date);

    }

    private getLastUpdateDate(): Date | null {

        if (!this.Price || this.Price.length === 0)
            return null;

        return this.Price.reduce((a, b) => a.date > b.date ? a : b).date;

    }

}