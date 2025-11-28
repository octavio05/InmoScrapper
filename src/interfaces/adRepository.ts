import { Ad } from "./ad";

export interface IAdRepository {

    addOrUpdate(ads: Ad[]): Promise<void>;

}