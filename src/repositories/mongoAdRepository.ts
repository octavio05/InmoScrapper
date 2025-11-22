import { Collection } from "mongodb";
import { Ad } from "../interfaces/ad";
import { DatabaseAdapter } from "../interfaces/DatabaseAdapter";
import { AdRepository } from "../interfaces/adRepository";

/**
 * MongoAdRepository class that implements the AdRepository interface.
 * This class provides methods to manipulate ads in a MongoDB database.
 */
export class MongoAdRepository implements AdRepository{

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

        const collection: Collection<Ad> = await this.connect();

        for (const ad of ads) {

            await collection.findOneAndUpdate(
                { Id: ad.Id, Portal: ad.Portal },
                {
                    $push: {
                        Price: {
                            value: ad.Price[0].value,
                            date: new Date()
                        }
                    },
                    $set: {
                        Portal: ad.Portal,
                        Direction: ad.Direction,
                        Property: ad.Property,
                        Images: ad.Images,
                        Description: ad.Description,
                        Features: ad.Features
                    }
                },
                { upsert: true }
            );

        }

        await this._databaseManager.disconnect();

    }

    /**
     * Open a connection to the database and get the ads collection. 
     * @returns Promise that resolves to the ads Collection. 
     */
    private async connect(): Promise<Collection<Ad>> {

        return await this._databaseManager.connect<Ad>();

    }


}