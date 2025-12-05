import { Ad } from "./ad";

export interface DatabaseAdapter {

    connect(): Promise<void>;

    disconnect(): Promise<void>;

    addOrUpdate(ad: Ad): Promise<void>

}