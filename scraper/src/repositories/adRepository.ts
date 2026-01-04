import { Ad } from "../interfaces/ad";
import { DatabaseAdapter } from "../interfaces/databaseAdapter";
import { IAdRepository } from "../interfaces/adRepository";
import { PortalType } from "../enums/portalType";

/**
 * MongoAdRepository class that implements the AdRepository interface.
 * This class provides methods to manipulate ads in a MongoDB database.
 */
export class AdRepository implements IAdRepository {

    private readonly _databaseManager: DatabaseAdapter;

    constructor(databaseManager: DatabaseAdapter) {

        if (databaseManager === null || databaseManager === undefined)
            throw new Error('databaseManager cannot be null or undefined');

        this._databaseManager = databaseManager;

    }

    /**
     * Adds or updates ads in the database. 
     * @param ads Array of Ad objects to be added or updated. 
     */
    public async addOrUpdate(ads: Ad[]): Promise<void> {

        await this._databaseManager.connect();

        try {

            for (const ad of ads)
                await this._databaseManager.addOrUpdate(ad);

        } finally {

            await this._databaseManager.disconnect();

        }

    }

    /**
     * Gets an ad from the database.
     * @param id Ad ID.
     * @param portalType Portal type.
     * @returns Ad object or null if not found.
     */
    public async get(id: string, portalType: PortalType): Promise<Ad | null> {

        await this._databaseManager.connect();

        try {

            return await this._databaseManager.get(id, portalType);

        } finally {

            await this._databaseManager.disconnect();

        }

    }

}