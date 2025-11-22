import { AnyBulkWriteOperation, Collection } from "mongodb";

export interface DatabaseAdapter {

    connect<T>(): Promise<Collection<any>>;

    disconnect(): Promise<void>;

}