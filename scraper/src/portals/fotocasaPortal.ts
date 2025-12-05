import { IPortal } from "../interfaces/portal";
import { Ad } from "../interfaces/ad";
import { PortalType } from "../enums/portalType";
import { PropertyType } from "../enums/propertyType";
import { BrowserAdapter } from "../interfaces/browserAdapter";
import { BrowserElement } from "../interfaces/browserElement";
import { PortalUrl } from "../interfaces/portalDefinition";

/**
 * FotocasaPortal class that implements the Portal interface.
 * This class provides methods to extract ads from the Fotocasa website.
 */
export class FotocasaPortal implements IPortal {

    private readonly _browser: BrowserAdapter;

    /**
     * Constructor for FotocasaPortal.
     * @param browser BrowserAdapter object.
     * @throws Error if browser is null or undefined.
     */
    constructor(browser: BrowserAdapter) {

        if (!browser)
            throw new Error('Browser cannot be null or undefined');

        this._browser = browser;

    }

    /**
     * Extracts ads from the Fotocasa webpage. 
     * @returns A Promise that resolves to an array of Ad objects.
     */
    public async getAds(splitUrl: PortalUrl): Promise<Ad[]> {

        const date: Date = new Date();
        let nextPage: string | null = null;
        let data: Ad[][] = [];
        let url = `${splitUrl.base}/${splitUrl.filter}/?${splitUrl.params}`;

        try {

            do {

                await this._browser.open();
                await this._browser.goto(url);

                await this._browser.screenshot('./screenshots/fotocasa-getads-aftergoto.png');

                await this.beforeGetAds();

                await this._browser.screenshot('./screenshots/fotocasa-getads-afterbeforegetads.png');

                data.push(await this.scrapingAdsList(date));

                nextPage = await this.getNetxtPageUrl();
                if (nextPage !== null) {

                    url = `${splitUrl.base}${nextPage}`;
                    await this._browser.waitForTimeout(3000);
                    await this._browser.close();

                }

            } while (nextPage !== null);

        }
        catch (error) {

            await this._browser.screenshot('./screenshots/fotocasa-getads-error.png');
            throw error;

        }
        finally {

            if (this._browser.isOpen())
                await this._browser.close();

        }

        return data.flat();

    }

    private async scrapingAdsList(date: Date): Promise<Ad[]> {
        const adsElements: BrowserElement[] = await this._browser.getElements('#main-content article');
        const uniqueAdsMap = new Map<string, Ad>();

        await Promise.all(
            adsElements.map(async a => {
                const match = (await a.getElement('.w-full h3 > a')?.getAttribute('href'))?.match(/\/(\d+)\//);
                const Id = match ? match[1] : '';

                if (Id) {
                    const Direction = (await a.getElement('.w-full h3 > a > span')?.textContent() || '').trim().replace(/<[^>]+>/g, '');
                    const priceHtml = (await a.getElement('.w-full div > span')?.textContent())?.trim().replace(/<[^>]*>/g, '').replace(/[^\d]/g, '');
                    const priceValue = priceHtml ? parseInt(priceHtml) : null;

                    uniqueAdsMap.set(Id, {
                        'Portal': PortalType.FOTOCASA,
                        'Property': PropertyType.GARAGE,
                        Id,
                        Direction,
                        'Description': '',
                        'Features': [],
                        'Images': [],
                        'Price': [{
                            'value': priceValue,
                            'date': date
                        }]
                    });
                }
            })
        );

        return Array.from(uniqueAdsMap.values());
    }

    /**
     * Executed before getAds method.
     * Accept cookies and scroll to lazy load.
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

        await this._browser.scrollToBottom();

        await this._browser.waitForTimeout(2000);

    }

    /**
     * Get the URL of the next page.
     * @returns The URL of the next page or null if there is no next page.
     */
    private async getNetxtPageUrl(): Promise<string | null> {

        const linkNextPage: BrowserElement | null = await this._browser.getElement('[data-panot-component="pagination-next-button"]');

        if (!linkNextPage)
            return null;

        return (await linkNextPage.getElement('a')?.getAttribute('href')) || null;

    }

}