import { Ad } from "./ad";

export interface IPortal {

    getAds(): Promise<Ad[]>;

}