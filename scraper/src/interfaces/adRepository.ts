import { PortalType } from "../enums/portalType";
import { Ad } from "./ad";

export interface IAdRepository {

    addOrUpdate(ads: Ad[]): Promise<void>;

    get(id: string, portalType: PortalType): Promise<Ad | null>;

}