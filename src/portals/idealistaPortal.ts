import { Locator, Page } from "@playwright/test";
import { IPortal } from "../interfaces/portal";
import { Ad } from "../interfaces/ad";
import { PortalType } from "../enums/portalType";
import { PropertyType } from "../enums/propertyType";
import { Portal } from "./portal";

/**
 * IdealistaPortal class that implements the Portal interface.
 * This class provides methods to extract ads from the Idealista website.
 */
export class IdealistaPortal extends Portal implements IPortal {

    /**
     * Constructor for IdealistaPortal.
     * @param page Playwright Page object.
     * @throws Error if page is null or undefined.
     */
    constructor(page: Page) {

        super(page);

    }

    /**
     * Extracts ads from the Idealista webpage. 
     * @returns A Promise that resolves to an array of Ad objects.
     */
    public async getAds(): Promise<Ad[]> {

        await this.beforeGetAds();

        const date: Date = new Date();
        let nextPage: Locator | null;
        let data: Ad[][] = [];

        // do {

        //     data.push(await this.scrapingAdsList(date));

        //     const scrollHeight = await this._page.evaluate(() => document.querySelector('.items-container')?.scrollHeight || 0);
        //     await this.scrollTo(scrollHeight);

        //     //     await this.simulateHuman();

        //     nextPage = await this.getNextPage();

        //     if (nextPage !== null) {

        //         //         const scrollHeight = await this._page.evaluate(() => document.querySelector('.items-container')?.scrollHeight || 0);
        //         //         await this.scrollTo(scrollHeight);

        //         // Delay importante antes de hacer click a siguiente página
        //         await this._page.waitForTimeout(2000 + Math.random() * 3000);
        //         await nextPage.click();

        //         // Esperar a que cargue la página
        //         await this._page.waitForTimeout(3000 + Math.random() * 2000);

        //     }

        // } while (nextPage !== null);

        // return await this.scrapingAdContent(data.flat());

        return (await this.scrapingAdsList(date)).flat();

        // return data.flat();

    }

    /**
     * Starts the scraping process for the current page.
     * @param date Current date
     * @returns a Promise that resolves to an array of Ad objects.
     */
    private async scrapingAdsList(date: Date): Promise<Ad[]> {

        const ads = await this._page.locator('#main-content > section > article.item').all();
        return await Promise.all(
            ads
                .filter(async a => await a.getAttribute('data-element-id') !== undefined)
                .map(async a => ({
                    'Portal': PortalType.IDEALISTA,
                    'Property': PropertyType.GARAGE,
                    'Id': await a.getAttribute('data-element-id')! || '',
                    'Direction': (await a.locator('.item-info-container > a').first().textContent())?.trim() || '',
                    'Description': '',
                    'Features': [],
                    'Images': [],
                    'Price': [{
                        'value':
                            (await a.locator('.item-price').textContent()) === undefined ?
                                null :
                                parseInt((await a.locator('.item-price').textContent())!.trim()
                                    .replace(/<[^>]*>/g, '')
                                    .replace(/[^\d]/g, '')
                                ),
                        'date': date
                    }]
                }))
        );

    }

    /**
     * Scrapes the content for each ad.
     * @param ads Array of Ad objects. 
     * @returns A Promise that resolves to an array of Ad objects with content filled.  
     */
    private async scrapingAdContent(ads: Ad[]): Promise<Ad[]> {

        for (const ad of ads) {

            await this.simulateHuman();

            await this._page.click(`article[data-element-id='${ad.Id}'] a.item-link`);

            // Esperar carga de página
            await this._page.waitForTimeout(2000 + Math.random() * 2000);
            await this.simulateHuman();

            ad.Description = await this.scrapingDescription();
            ad.Features = await this.scrapingFeatures();
            ad.Images = await this.scrapingImages();

            await this._page.click('#pager .--not-mobile a');

        }

        return ads;

    }

    /**
     * Scrapes the description of the ad.
     * @returns Ad description
     */
    private async scrapingDescription(): Promise<string> {

        return (await this._page.locator('.comment p').innerText()).trim();

    }

    /**
     * Scrapes the features of the ad.
     * @returns Ad features
     */
    private async scrapingFeatures(): Promise<string[]> {

        const features = await this._page.locator('.details-property li').all();
        return Promise.all(
            features.map(async f => (await f.textContent())?.trim() || '')
        );

    }

    /**
     * Scrapes the images of the ad.
     * @returns Ad images
     */
    private async scrapingImages(): Promise<string[]> {

        const scrollHeight = await this._page.evaluate(() => document.body.scrollHeight);
        await this.scrollTo(scrollHeight);

        if (await this._page.locator('#main-multimedia .more').count() > 0)
            await this._page.click('#main-multimedia .more-photos');

        const htmlImages: Locator[] = await this._page.locator('#main-multimedia picture img').all();

        return await Promise.all(htmlImages.map(img => img.getAttribute('src'))) as string[];

    }

    /**
     * Gets the locator for the next page link.
     * @returns next page Locator or null if not found.
     */
    private async getNextPage(): Promise<Locator | null> {

        const linkNextPage = this._page.locator('.pagination li.next > a');

        if (await linkNextPage.count() === 0)
            return null;

        return linkNextPage;

    }

    /**
     * Executes actions required before starting to get ads.
     */
    private async beforeGetAds(): Promise<void> {

        // Esperar a que el modal esté visible
        await this._page.waitForSelector('#didomi-notice-agree-button',
            { timeout: 10000 });

        // Esperar a que sea clickeable (no bloqueado)
        const button = this._page.locator('#didomi-notice-agree-button');

        // Scroll para asegurar visibilidad
        await button.scrollIntoViewIfNeeded();

        // Delay antes de click
        await this._page.waitForTimeout(2000);

        // Click con força
        await button.click({ force: true });

        // Esperar a que desaparezca el modal
        await this._page.waitForSelector('#didomi-host',
            { state: 'hidden', timeout: 5000 });

        await this._page.waitForTimeout(2000);

    }

    private async simulateHuman() {

        // Delays más naturales (3-11 segundos)
        await this._page.waitForTimeout(3000 + Math.random() * 8000);

        // Movimientos aleatorios en viewport
        // const x = Math.random() * window.innerWidth;
        // const y = Math.random() * window.innerHeight;
        const x = Math.random() * await this._page.evaluate(() => window.innerWidth || 0);
        const y = Math.random() * await this._page.evaluate(() => window.innerHeight || 0);
        await this._page.mouse.move(x, y);

        // Pausa realista
        await this._page.waitForTimeout(800 + Math.random() * 1500);

        // Scroll gradual
        await this._page.keyboard.press('PageDown');
        await this._page.waitForTimeout(1500 + Math.random() * 2500);

    }

}