import { BrowserAdapter } from "./browserAdapter";
import { IPortal } from "./portal";

export interface PortalDefinition {
    url: PortalUrl;
    portal: new (browser: BrowserAdapter) => IPortal;
}

export interface PortalUrl {
    base: string;
    filter: string;
    params: string;
}