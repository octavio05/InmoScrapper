import { Ad } from "./ad";

export interface AdRepository {

    addOrUpdate(ads: Ad[]): Promise<void>;

}