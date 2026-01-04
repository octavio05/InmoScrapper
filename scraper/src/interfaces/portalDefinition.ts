import { BrowserAdapter } from "./browserAdapter";
import { ILogger } from "./logger";
import { IPortal } from "./portal";

export interface PortalDefinition {
    url: PortalUrl;
    portal: new (browser: BrowserAdapter, log: ILogger) => IPortal;
}

export interface PortalUrl {
    base: string;
    filter: string;
    params: string;
}