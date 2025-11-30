import { IPortal } from "../interfaces/portal";
import { Ad } from "../interfaces/ad";
import { PortalType } from "../enums/portalType";
import { PropertyType } from "../enums/propertyType";
import { BrowserAdapter } from "../interfaces/browserAdapter";
import { BrowserElement } from "../interfaces/browserElement";
import { PortalUrl } from "../interfaces/portalDefinition";

/**
 * IdealistaPortal class that implements the Portal interface.
 * This class provides methods to extract ads from the Idealista website.
 */
export class IdealistaPortal implements IPortal {

    private readonly _browser: BrowserAdapter;

    /**
     * Constructor for IdealistaPortal.
     * @param browser BrowserAdapter object.
     * @throws Error if browser is null or undefined.
     */
    constructor(browser: BrowserAdapter) {

        if (!browser)
            throw new Error('Browser cannot be null or undefined');

        this._browser = browser;

    }

    /**
     * Extracts ads from the Idealista webpage. 
     * @returns A Promise that resolves to an array of Ad objects.
     */
    public async getAds(splitUrl: PortalUrl): Promise<Ad[]> {

        const date: Date = new Date();
        let nextPage: string | null;
        let data: Ad[][] = [];
        let url: string = `${splitUrl.base}/${splitUrl.filter}/?${splitUrl.params}`;

        try {

            do {

                await this._browser.open();
                await this._browser.goto(url);

                await this._browser.screenshot('./screenshots/idealista-getads-aftergoto.png');

                await this.beforeGetAds();

                await this._browser.screenshot('./screenshots/idealista-getads-afterbeforegetads.png');

                data.push(await this.scrapingAdsList(date));

                nextPage = await this.getNextPageUrl();
                if (nextPage !== null) {

                    url = `${splitUrl.base}${nextPage}`;
                    await this._browser.waitForTimeout(3000);
                    await this._browser.close();

                }

            } while (nextPage !== null);

        }
        catch (error) {

            await this._browser.screenshot('./screenshots/idealista-getads-error.png');
            throw error;

        }
        finally {

            if (this._browser.isOpen())
                await this._browser.close();

        }

        return data.flat();

    }

    /**
     * Starts the scraping process for the current page.
     * @param date Current date 
     * @returns a Promise that resolves to an array of Ad objects.
     */
    private async scrapingAdsList(date: Date): Promise<Ad[]> {

        const ads: BrowserElement[] = await this._browser.getElements('#main-content > section > article.item');
        return await Promise.all(
            ads
                .filter(async a => await a.getAttribute('data-element-id') !== undefined)
                .map(async a => ({
                    'Portal': PortalType.IDEALISTA,
                    'Property': PropertyType.GARAGE,
                    'Id': await a.getAttribute('data-element-id')! || '',
                    'Direction': (await a.getElement('.item-info-container > a').textContent())?.trim() || '',
                    'Description': '',
                    'Features': [],
                    'Images': [],
                    'Price': [{
                        'value':
                            (await a.getElement('.item-price')?.textContent()) === undefined ?
                                null :
                                parseInt((await a.getElement('.item-price')?.textContent())!.trim()
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
    // private async scrapingAdContent(ads: Ad[]): Promise<Ad[]> {

    //     for (const ad of ads) {

    //         await this.simulateHuman();

    //         await this._page.click(`article[data-element-id='${ad.Id}'] a.item-link`);

    //         // Esperar carga de página
    //         await this._page.waitForTimeout(2000 + Math.random() * 2000);
    //         await this.simulateHuman();

    //         ad.Description = await this.scrapingDescription();
    //         ad.Features = await this.scrapingFeatures();
    //         ad.Images = await this.scrapingImages();

    //         await this._page.click('#pager .--not-mobile a');

    //     }

    //     return ads;

    // }

    /**
     * Scrapes the description of the ad.
     * @returns Ad description
     */
    // private async scrapingDescription(): Promise<string> {

    //     return (await this._page.locator('.comment p').innerText()).trim();

    // }

    /**
     * Scrapes the features of the ad.
     * @returns Ad features
     */
    // private async scrapingFeatures(): Promise<string[]> {

    //     const features = await this._page.locator('.details-property li').all();
    //     return Promise.all(
    //         features.map(async f => (await f.textContent())?.trim() || '')
    //     );

    // }

    /**
     * Scrapes the images of the ad.
     * @returns Ad images
     */
    // private async scrapingImages(): Promise<string[]> {

    //     const scrollHeight = await this._page.evaluate(() => document.body.scrollHeight);
    //     await this.scrollTo(scrollHeight);

    //     if (await this._page.locator('#main-multimedia .more').count() > 0)
    //         await this._page.click('#main-multimedia .more-photos');

    //     const htmlImages: Locator[] = await this._page.locator('#main-multimedia picture img').all();

    //     return await Promise.all(htmlImages.map(img => img.getAttribute('src'))) as string[];

    // }

    /**
     * Gets the locator for the next page link.
     * @returns next page Locator or null if not found.
     */
    private async getNextPageUrl(): Promise<string | null> {

        const linkNextPage: BrowserElement | null = await this._browser.getElement('.pagination li.next > a');

        if (!linkNextPage)
            return null;

        return await linkNextPage.getAttribute('href');

    }

    /**
     * Executes actions required before starting to get ads.
     */
    private async beforeGetAds(): Promise<void> {

        // Esperar a que el modal esté visible
        await this._browser.waitForSelector('#didomi-notice-agree-button',
            { timeout: 10000 });

        // Esperar a que sea clickeable (no bloqueado)
        const button: BrowserElement | null = await this._browser.getElement('#didomi-notice-agree-button');

        // Scroll para asegurar visibilidad
        await button!.scrollIntoViewIfNeeded();

        // Delay antes de click
        await this._browser.waitForTimeout(2000);

        // Click con força

        await button!.click({ force: true });

        // Esperar a que desaparezca el modal
        await this._browser.waitForSelector('#didomi-host',
            { state: 'hidden', timeout: 5000 });

        await this._browser.waitForTimeout(2000);

    }

    // private async simulateHuman() {

    //     // Delays más naturales (3-11 segundos)
    //     await this._page.waitForTimeout(3000 + Math.random() * 8000);

    //     // Movimientos aleatorios en viewport
    //     // const x = Math.random() * window.innerWidth;
    //     // const y = Math.random() * window.innerHeight;
    //     const x = Math.random() * await this._page.evaluate(() => window.innerWidth || 0);
    //     const y = Math.random() * await this._page.evaluate(() => window.innerHeight || 0);
    //     await this._page.mouse.move(x, y);

    //     // Pausa realista
    //     await this._page.waitForTimeout(800 + Math.random() * 1500);

    //     // Scroll gradual
    //     await this._page.keyboard.press('PageDown');
    //     await this._page.waitForTimeout(1500 + Math.random() * 2500);

    // }

}