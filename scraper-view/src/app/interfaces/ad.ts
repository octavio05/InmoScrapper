import { PortalType } from "../enums/portalType";
import { PropertyType } from "../enums/propertyType";

export interface Ad {
    PortalId: string;
    Portal: PortalType;
    Property: PropertyType;
    Id: string;
    Direction: string;
    Price: Price[];
    PriceAverage: number;
    CreationDate: Date;
    LastUpdateDate: Date;
    PortalUrl: string;
}

export interface Price {
    value: number | null;
    date: Date;
}