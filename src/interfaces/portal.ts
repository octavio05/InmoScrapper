import { Ad } from "./ad";
import { PortalUrl } from "./portalDefinition";

export interface IPortal {

    getAds(url: PortalUrl): Promise<Ad[]>;

}