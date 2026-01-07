import { PortalType } from "../enums/portalType";
import { PropertyType } from "../enums/propertyType";

export interface AdDto {
    PortalId: string;
    Portal: PortalDto;
    Property: PropertyType;
    Id: string;
    Direction: string;
    Price: PriceDto[];
    PriceAverage: number;
    CreationDate: Date;
    LastUpdateDate: Date;
}

export interface PriceDto {
    value: number | null;
    date: Date;
}

export interface PortalDto {
    Type: PortalType;
    Url: string;
}