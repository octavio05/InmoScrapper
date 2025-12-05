import dotenv from 'dotenv';
import path from 'path';
import { Config } from './interfaces/config';
import { Logger } from './logger';

const log = new Logger(path.resolve(process.cwd(), 'logs'));
const envFile = `../.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

function requireEnv(key: string): string {

    const value = process.env[key];
    if (!value) {
        log.fatal(`Environment variable ${key} is required.`);
        throw new Error(`Environment variable ${key} is required.`);
    }

    return value;

}

export const config: Config = {

    NODE_ENV: requireEnv('NODE_ENV') as Config["NODE_ENV"],
    DB_USER: requireEnv('DB_USER'),
    DB_PASSWORD: requireEnv('DB_PASSWORD'),
    DB_PORT: parseInt(requireEnv('DB_PORT')),
    DB_HOST: requireEnv('DB_HOST'),
    DB_NAME: requireEnv('DB_NAME'),

}
