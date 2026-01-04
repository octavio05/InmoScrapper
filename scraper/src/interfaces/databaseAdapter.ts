import { PortalType } from "../enums/portalType";
import { Ad } from "./ad";

export interface DatabaseAdapter {

    connect(): Promise<void>;

    disconnect(): Promise<void>;

    addOrUpdate(ad: Ad): Promise<void>

    get(id: string, portalType: PortalType): Promise<Ad | null>

}