import { PortalType } from "../enums/portalType";
import { PropertyType } from "../enums/propertyType";

export interface Ad {
    Portal: PortalType;
    Property: PropertyType;
    Id: string;
    Direction: string;
    Description: string;
    Features: string[];
    Images: string[];
    Price: {
        value: number | null;
        date: Date;
    }[];
}