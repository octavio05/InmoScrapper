import { Page } from "@playwright/test";
import { Ad } from "../interfaces/ad";
import { IPortal } from "../interfaces/portal";

export abstract class Portal implements IPortal {

    protected readonly _page: Page;

    constructor(page: Page) {

        if (!page)
            throw new Error('Page cannot be null or undefined');
        
        this._page = page;

    }

    /**
     * Scrolls the page to the specified height.
     * @param scrollHeight Height to scroll to.
     */
    protected async scrollTo(scrollHeight: number): Promise<void> {

        let currentHeight = 0;

        while (currentHeight < scrollHeight) {

            currentHeight += 1000;
            if (currentHeight > scrollHeight)
                currentHeight = scrollHeight;

            await this._page.evaluate((height) => window.scrollTo(0, height), currentHeight);
            await this._page.waitForTimeout(1000);            

        }  

    }      

    public abstract getAds(): Promise<Ad[]>;

}