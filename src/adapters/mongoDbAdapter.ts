import { Collection, Db, MongoClient } from "mongodb";
import { DatabaseAdapter } from "../interfaces/databaseAdapter";
import { Ad } from "../interfaces/ad";

/**
 * MongoDbAdapter class that implements the DatabaseAdapter interface.
 * This class provides methods to connect to and disconnect from a MongoDB database.
 */
export class MongoDbAdapter implements DatabaseAdapter {

    private readonly _uri: string;
    private readonly _dbName: string;
    private readonly _collectionName: string = "ads";
    private _collection: Collection<Document> | null = null;
    private _client: MongoClient | null = null;

    /**
     * Constructor for MongoDbAdapter.
     * @param uri MongoDB connection string.
     * @param dbName Name of the database to connect to.
     * @param collectionName Name of the collection to use.
     * @throws Error if any of the parameters are null or empty.
     */
    constructor(uri: string, dbName: string, collectionName: string) {

        if (uri === null || uri === undefined || uri.trim() === '')
            throw new Error('uri cannot be null or empty');

        if (dbName === null || dbName === undefined || dbName.trim() === '')
            throw new Error('dbName cannot be null or empty');

        if (collectionName === null || collectionName === undefined || collectionName.trim() === '')
            throw new Error('collectionName cannot be null or empty');

        this._uri = uri;
        this._dbName = dbName;
        this._collectionName = collectionName;

    }

    /**
     * Connects to the MongoDB database and returns the specified collection.
     * @returns Promise that resolves to a Collection of type T.
     */
    public async connect(): Promise<void> {

        this._client = new MongoClient(this._uri);
        await this._client!.connect();
        const database = this._client!.db(this._dbName);

        this._collection = await this.getCollection(database);

    }

    /**
     * Disconnects from the MongoDB database.
     */
    public async disconnect(): Promise<void> {

        if (this._client) {

            await this._client!.close();
            this._client = null;
            this._collection = null;

        }

    }

    public async addOrUpdate(ad: Ad): Promise<void> {

        await this._collection!.findOneAndUpdate(
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

    /**
     * Gets the specified collection from the database, creating it if it doesn't exist.
     * @param database Database instance. 
     * @returns Promise that resolves to the Collection of type T. 
     */
    private async getCollection<T extends Document>(database: Db): Promise<Collection<T>> {

        if (!await this.existsCollection(database))
            await database.createCollection<T>(this._collectionName);

        return database.collection<T>(this._collectionName);

    }

    /**
     * Checks if the specified collection exists in the database. 
     * @param database Database instance. 
     * @returns Promise that resolves to a boolean indicating existence. 
     */
    private async existsCollection(database: Db): Promise<boolean> {

        const collections = await database.listCollections({}, { nameOnly: true }).toArray();
        return collections.some(col => col.name === this._collectionName);

    }

}