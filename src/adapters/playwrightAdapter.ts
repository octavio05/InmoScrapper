import { Browser, BrowserContext, Page } from "@playwright/test";
import { chromium } from "playwright-extra";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { BrowserAdapter } from "../interfaces/browserAdapter";
import { IPortal } from "../interfaces/portal";

/**
 * PlaywrightAdapter class that implements the BrowserAdapter interface.
 * This class provides methods to interact with web pages using Playwright.
 */
export class PlaywrightAdapter implements BrowserAdapter {

    // private readonly _contextConfiguration = {
    //     userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    //     viewport: { width: 1366, height: 768 },
    //     locale: 'es-ES',
    //     extraHTTPHeaders: {
    //         'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
    //         'referer': 'https://www.google.com/',
    //         'refererPolicy': 'strict-origin-when-cross-origin'
    //     }
    // };
    // private readonly _contextConfiguration = {
    //     userAgent:
    //         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.7444.60 Safari/537.36 Edg/142.0.0.0",
    //     locale: "es-ES",
    //     extraHTTPHeaders: {
    //         "sec-ch-ua": '"Chromium";v="142", "Microsoft Edge";v="142", "Not_A Brand";v="99"',
    //         "sec-ch-ua-platform": '"Windows"',
    //         "sec-ch-ua-arch": '"x86"',
    //         "sec-ch-ua-full-version-list": '"Chromium";v="142.0.7444.60", "Microsoft Edge";v="142.0.3595.53", "Not_A Brand";v="99.0.0.0"',
    //         "sec-ch-ua-mobile": "?0",
    //         "sec-ch-device-memory": "8",
    //         "accept-language": "es-ES,es;q=0.9,en;q=0.8",
    //         "upgrade-insecure-requests": "1",
    //         "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    //         "cache-control": "max-age=0",
    //         "referer": "https://www.google.com/",
    //         "dnt": "1",
    //         "connection": "keep-alive",
    //         "sec-fetch-dest": "document",
    //         "sec-fetch-mode": "navigate",
    //         "sec-fetch-site": "none",
    //         "sec-fetch-user": "?1",
    //         "sec-gpc": "1"
    //     },
    // };
    private _context: BrowserContext | null = null;
    private _browser: Browser | null = null;
    private _page: Page | null = null;

    // Lista de User-Agents modernos (Windows/Chrome & Edge) para rotación
    private readonly _userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0"
    ];

    /**
     * Navigates to the specified URL.
     * @param url URL to navigate to.
     * @throws Error if the URL is empty.
     */
    public async goto(url: string): Promise<void> {

        if (url === null || url === undefined || url.trim() === '')
            throw new Error('url cannot be null or empty');

        if (this._page === null)
            await this.initialize();

        this._page = await this.createPage(this._context!);

        // Navegación más robusta
        try {
            await this._page!.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        } catch (e) {
            console.log("Navigation timeout or error, retrying...", e);
            await this._page!.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        }

        // Esperar comportamiento humano aleatorio
        await this._page.waitForTimeout(2000 + Math.random() * 3000);

        // Verificar que DataDome no está presente
        // Nota: A veces es mejor capturar el error que esperar activamente si no salta siempre
        try {
            const isDataDome = await this._page.evaluate(() => document.body.innerHTML.includes('datadome'));
            if (isDataDome) {
                console.error("DataDome detected!");
                // Aquí se podría implementar lógica de reintento con nueva IP/Contexto
            }
        } catch (e) { }

    }

    /**
     * Factory method to create an instance of a Portal.
     * Calls the constructor of the provided Portal class with the current Page.
     * 
     * @param ctor Constructor of the Portal class.
     * @param args Arguments for the constructor.
     * @returns An instance of the specified Portal.
     */
    public ads<T extends IPortal>(ctor: new (...args: any[]) => T, ...args: ConstructorParameters<typeof ctor>): T {

        return new ctor(this._page);

    }

    /**
     * Takes a screenshot of the current page. 
     * @param path Path to save the screenshot.
     */
    public async screenshot(path: string): Promise<void> {

        if (this._page)
            await this._page.screenshot({ path });

    }

    /**
     * Closes the browser and releases resources.
     */
    public async close(): Promise<void> {

        if (this._page) await this._page.close();
        if (this._context) await this._context.close();
        if (this._browser) await this._browser.close();
        this._context = null;
        this._page = null;
        this._browser = null;

    }

    /**
     * Initializes the browser context.
     */
    private async initialize(): Promise<void> {

        this._browser = await this.createBrowser();

        // this._context = await this._browser.newContext(this._contextConfiguration);
        // this._context.addCookies([
        //     {
        //         name: 'datadome',
        //         value: '1w6~71kZtlRPnrtMOOqbBtFH6SQucyFW8zS25kUe~8EXhl5hdzSv3jVVHghUQcY47alBhwGo6CuIHHoxUq0yLRHdxwvcoAxCoprRMwjH1bsGqEwCFnSOq_cjzfXZFmaS',
        //         domain: '.idealista.com',
        //         path: '/',
        //     },
        //     {
        //         name: 'SESSION',
        //         value: 'a1ac6840e8b8bad3~a80ecf6a-7209-47c7-826f-911c08729c03',
        //         domain: 'www.idealista.com',
        //         path: '/'
        //     },
        //     {
        //         name: '_pcid',
        //         value: '%7B%22browserId%22%3A%22mhzzf1a2gj3gvwmc%22%2C%22_t%22%3A%22mxoecisd%7Cmhzzf1gd%22%7D',
        //         domain: 'www.idealista.com',
        //         path: '/'
        //     },
        //     {
        //         name: '_rtbh.uid',
        //         value: '%7B%22eventType%22%3A%22uid%22%2C%22id%22%3A%22unknown%22%2C%22expiryDate%22%3A%222026-11-16T08%3A45%3A09.330Z%22%7D',
        //         domain: 'www.idealista.com',
        //         path: '/'
        //     }
        // ]);

        // Selección aleatoria de User-Agent
        const userAgent = this._userAgents[Math.floor(Math.random() * this._userAgents.length)];

        this._context = await this._browser.newContext({
            userAgent: userAgent,
            viewport: { width: 1920, height: 1080 }, // Viewport más estándar de escritorio
            locale: 'es-ES',
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: false,
            extraHTTPHeaders: {
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Upgrade-Insecure-Requests': '1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                // Referer dinámico es mejor, pero Google es un buen default inicial
                'Referer': 'https://www.google.es/'
            }
        });

        // No inyectamos cookies hardcodeadas.
        // Si necesitas cookies de sesión, deberías obtenerlas dinámicamente o dejar que se creen.
    }

    /**
     * Creates and configures a Playwright browser instance.
     * @returns A Promise that resolves to a Browser instance.
     */
    private async createBrowser(): Promise<Browser> {

        // chromium.use(StealthPlugin());

        return await chromium.launch({
            // channel: 'msedge',
            headless: false,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--start-maximized',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
            ]
        });

    }

    /**
     * Creates and configures a new Page within the given BrowserContext.
     * @param context The BrowserContext to create the Page in. 
     * @returns A Promise that resolves to a Page instance. 
     */
    private async createPage(context: BrowserContext): Promise<Page> {

        const page: Page = await context.newPage();

        await page.addInitScript(() => {
            // navigator.webdriver -> undefined
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

            // Simular plugins
            // @ts-ignore
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });

            // Simular languages
            // @ts-ignore
            Object.defineProperty(navigator, 'languages', { get: () => ['es-ES', 'es'] });

            // window.chrome
            // @ts-ignore
            window.chrome = { runtime: {} };

            // Pasar algunas comprobaciones de permission
            const originalQuery = (navigator.permissions as any)?.query;
            if (originalQuery) {
                // @ts-ignore
                navigator.permissions.query = (parameters: any) =>
                    parameters.name === 'notifications'
                        ? Promise.resolve({ state: Notification.permission })
                        : originalQuery(parameters);
            }
        });

        return page;

    }
}