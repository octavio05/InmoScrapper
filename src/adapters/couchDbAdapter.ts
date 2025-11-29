import nano from "nano";
import { Ad } from "../interfaces/ad";
import { DatabaseAdapter } from "../interfaces/databaseAdapter";
import { DatabaseConfig } from "../interfaces/databaseConfig";

/**
 * Adapter for CouchDB
 */
export class CouchDbAdapter implements DatabaseAdapter {

    private readonly _config: DatabaseConfig | null = null;
    private _connection: nano.ServerScope | null = null;

    /**
     * Constructor
     * @param config Database configuration 
     * @throws Error if any of the parameters are null or empty.
     */
    constructor(config: DatabaseConfig) {

        this.validateConfig(config);

        this._config = config;

    }

    /**
     * Connect to CouchDB
     */
    public async connect(): Promise<void> {

        this._connection = nano(this.getConnectionString());

        const dbList: string[] = await this._connection.db.list();

        if (!dbList.includes(this._config!.dbName))
            await this._connection.db.create(this._config!.dbName);

    }

    /**
     * Disconnect from CouchDB
     */
    public async disconnect(): Promise<void> {

        if (this._connection) {

            this._connection.relax({ method: 'head', path: '/' });
            this._connection = null;

        }

    }

    /**
     * Adds or updates an ad in the database
     * @param newAd Ad to add or update
     * @throws Error if the connection is not established.
     */
    public async addOrUpdate(newAd: Ad): Promise<void> {

        const database = this._connection?.db.use<Ad>(this._config!.dbName);
        let ad;
        try {

            ad = (await database!.find({
                selector: {
                    Id: newAd.Id,
                    Portal: newAd.Portal
                }
            })).docs[0];
        }
        catch (error) {

            ad = null;

        }

        if (ad === null)
            ad = newAd;
        else
            ad.Price.push(newAd.Price[0]);

        await database?.insert(ad);

    }

    /**
     * Creates the connection string for the connection
     * @returns Connection string
     */
    private getConnectionString(): string {

        return `http://${this._config!.user}:${this._config!.password}@${this._config!.host}:${this._config!.port}`;

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
}