import { Collection, Db, MongoClient } from "mongodb";
import { DatabaseAdapter } from "../interfaces/databaseAdapter";
import { Ad } from "../interfaces/ad";
import { DatabaseConfig } from "../interfaces/databaseConfig";

/**
 * MongoDbAdapter class that implements the DatabaseAdapter interface.
 * This class provides methods to connect to and disconnect from a MongoDB database.
 */
export class MongoDbAdapter implements DatabaseAdapter {

    private readonly _config: DatabaseConfig | null = null;
    private readonly _collectionName: string = "ads";
    private _collection: Collection<Document> | null = null;
    private _client: MongoClient | null = null;

    /**
     * Constructor for MongoDbAdapter.
     * @param config Database configuration.
     * @param collectionName Name of the collection to use.
     * @throws Error if any of the parameters are null or empty.
     */
    constructor(config: DatabaseConfig, collectionName: string) {

        this.validateConfig(config);

        if (collectionName === null || collectionName === undefined || collectionName.trim() === '')
            throw new Error('collectionName cannot be null or empty');

        this._config = config;
        this._collectionName = collectionName;

    }

    /**
     * Connects to the MongoDB database and returns the specified collection.
     * @returns Promise that resolves to a Collection of type T.
     */
    public async connect(): Promise<void> {

        this._client = new MongoClient(this.getConnectionString());
        await this._client!.connect();
        const database = this._client!.db(this._config!.dbName);

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

    /**
     * Adds or updates an ad in the MongoDB database.
     * @param ad Ad to add or update.
     * @returns Promise that resolves to void.
     */
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
     * Validates the database configuration.
     * @param config Database configuration.
     * @throws Error if any of the parameters are null or empty.
     */
    private validateConfig(config: DatabaseConfig) {

        if (config === null || config === undefined)
            throw new Error('config cannot be null or undefined');

        if (config.user === null || config.user === undefined || config.user.trim() === '')
            throw new Error('user cannot be null or empty');

        if (config.password === null || config.password === undefined || config.password.trim() === '')
            throw new Error('password cannot be null or empty');

        if (config.host === null || config.host === undefined || config.host.trim() === '')
            throw new Error('host cannot be null or empty');

        if (config.port === null || config.port === undefined)
            throw new Error('port cannot be null or undefined');

        if (config.dbName === null || config.dbName === undefined || config.dbName.trim() === '')
            throw new Error('dbName cannot be null or empty');

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

    /**
     * Creates the MongoDB connection string.
     * @returns MongoDB connection string.
     */
    private getConnectionString(): string {

        return `mongodb://${this._config!.user}:${this._config!.password}@${this._config!.host}:${this._config!.port}`;

    }

}