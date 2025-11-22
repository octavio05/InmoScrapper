import { Page } from "@playwright/test";
import { IPortal } from "../interfaces/portal";
import { Ad } from "../interfaces/ad";
import { PortalType } from "../enums/portalType";
import { PropertyType } from "../enums/propertyType";
import { Portal } from "./portal";

/**
 * FotocasaPortal class that implements the Portal interface.
 * This class provides methods to extract ads from the Fotocasa website.
 */
export class FotocasaPortal extends Portal implements IPortal{

    /**
     * Constructor for FotocasaPortal.
     * @param page Playwright Page object.
     * @throws Error if page is null or undefined.
     */
    constructor(page: Page) {

        super(page);

    }

    /**
     * Extracts ads from the Fotocasa webpage. 
     * @returns A Promise that resolves to an array of Ad objects.
     */
    public async getAds(): Promise<Ad[]> {

        await this.beforeGetAds();

        const date: Date = new Date();

        const ads = await this._page.$$eval(
            '#main-content article',
            (nodes, opts: { portalType: PortalType, propertyType: PropertyType, date: Date }) =>
            nodes
                .map(n => {
                    const match = n.querySelector('.w-full h3 > a')?.getAttribute('href')?.match(/\/(\d+)\//);
                    const Id = match ? match[1] : '';

                    const directionRaw = n.querySelector('.w-full h3 > a > span')?.textContent || '';
                    const Direction = directionRaw.trim().replace(/<[^>]+>/g, '');

                    const priceHtml = n.querySelector('.w-full div > span')?.innerHTML || '';
                    const priceClean = priceHtml.trim().replace(/<[^>]*>/g, '').replace(/[^\d]/g, '');
                    const priceValue = priceClean ? parseInt(priceClean) : null;

                    return {
                        'Portal': opts.portalType,
                        'Property': opts.propertyType,
                        Id,
                        Direction,
                        'Description': '',
                        'Features': [],
                        'Images': [],
                        'Price': [{
                            'value': priceValue,
                            'date': opts.date
                        }]
                    };
                }),
            { portalType: PortalType.FOTOCASA, propertyType: PropertyType.GARAGE, date }
        );

        // Filter out duplicates by ID, keeping the first occurrence
        return Array.from(
            new Map(ads.map(ad => [ad.Id, ad])).values()
        );

    }

    /**
     * Executed before getAds method.
     * Accept cookies and scroll to lazy load.
     */
    private async beforeGetAds(): Promise<void> {

        await this._page.click('#didomi-notice-agree-button');
        await this._page.waitForTimeout(1000);

        const scrollHeight = await this._page.evaluate(() => document.body.scrollHeight);
        await this.scrollTo(scrollHeight);

    }

}