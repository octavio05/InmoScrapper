import { IPortal } from "./portal";

export interface BrowserAdapter {

    goto(url: string): Promise<void>;

    ads<T extends IPortal>(ctor: new (...args: any[]) => T, ...args: ConstructorParameters<typeof ctor>): T;

    screenshot(path: string): Promise<void>;

    close(): Promise<void>;

}