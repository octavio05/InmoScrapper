import { BrowserAdapter } from './interfaces/browserAdapter';
import { PlaywrightAdapter } from './adapters/playwright/playwrightAdapter';
import { IdealistaPortal } from './portals/idealistaPortal';
import { Ad } from './interfaces/ad';
import { DatabaseAdapter } from './interfaces/databaseAdapter';
import { MongoDbAdapter } from './adapters/mongoDbAdapter';
import { IAdRepository } from './interfaces/adRepository';
import { AdRepository } from './repositories/adRepository';
import { FotocasaPortal } from './portals/fotocasaPortal';
import { Logger } from './logger';
import * as path from 'path';
import { ILogger } from './interfaces/logger';
import { PortalDefinition } from './interfaces/portalDefinition';
import { config } from './config';
import { IPortal } from './interfaces/portal';

(async () => {

    const log = new Logger(path.resolve(process.cwd(), 'logs'));

    log.info(`start proccess (${process.env.NODE_ENV})`);

    const portalsDefinition: PortalDefinition[] = [
        {
            url: {
                base: 'https://www.idealista.com',
                filter: 'venta-garajes/telde/san-gregorio',
                params: 'ordenado-por=fecha-publicacion-desc'
            },
            portal: IdealistaPortal
        },
        {
            url: {
                base: 'https://www.fotocasa.es',
                filter: 'es/comprar/garajes/telde/san-gregorio/l',
                params: 'sortType=publicationDate'
            },
            portal: FotocasaPortal
        }
    ];

    let scrappingFunctions: any[] = [];
    portalsDefinition.forEach(definition => {
        scrappingFunctions.push(createScrappingFunction(definition, log));
    });

    const results = await Promise.allSettled(scrappingFunctions.map(fn => fn()));

    const portalData: Ad[] = [];
    results.forEach(result => {

        if (result.status === 'fulfilled')
            portalData.push(...result.value);

    });


    /******************************************* */

    const uri = getDbUri();
    const dbname = config.DB_NAME;
    const collectionName = "ads";

    try {

        const database: DatabaseAdapter = new MongoDbAdapter(uri, dbname, collectionName)
        const adRepository: IAdRepository = new AdRepository(database);

        await adRepository.addOrUpdate(portalData);

    }
    catch (error) {

        log.error(
            `Error produced on database proccess\n` +
            ` - uri: '${uri}'\n` +
            ` - dbname: '${dbname}'\n` +
            ` - collectionName: '${collectionName}'\n` +
            ` - portalData: '${JSON.stringify(portalData)}'\n` +
            `${(error as Error).stack}`

        );
    }

    log.info(`end proccess (${process.env.NODE_ENV})`);

})();

function createScrappingFunction(definition: PortalDefinition, log: ILogger): () => Promise<Ad[]> {

    return async function (): Promise<Ad[]> {

        const browser: BrowserAdapter = new PlaywrightAdapter();
        const portal: IPortal = new definition.portal(browser);
        let data: Ad[] = [];

        try {

            data = await portal.getAds(definition.url);

        }
        catch (error) {

            log.error(
                `Error produced on scrapping proccess\n` +
                ` - definition.url.base: '${definition.url.base}'\n` +
                ` - definition.url.filter: '${definition.url.filter}'\n` +
                ` - definition.url.params: '${definition.url.params}'\n` +
                ` - definition.portal: '${definition.portal.name}'\n` +
                `${(error as Error).stack}`
            );
            throw error;

        }

        return data;

    };

}

function getDbUri(): string {

    return `mongodb://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}`;

}