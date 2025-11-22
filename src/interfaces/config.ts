export interface Config {
    NODE_ENV: "development" | "production";
    DB_USER: string;
    DB_PASSWORD: string;
    DB_PORT: number
    DB_HOST: string;
    DB_NAME: string;
}