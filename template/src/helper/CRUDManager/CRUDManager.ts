import type { Collection, DataBase, DataBaseSession, Schema } from 'DBManager/Manager.js';

import _CRUDObject from './CRUDObject.js';

export { CRUDObject } from './CRUDObject.js';

export abstract class CRUDManager<
    DBSchema extends CRUDManager.DBSchema,
    data extends Object,
    create extends Object,
    update extends Object,
    CRUDType extends CRUDManager.CRUDObject<DBSchema, data, create, update, any>
> {
    public db: DataBaseSession<DBSchema>;
    /**
     * Create a new CRUDManager.
     * @param db - The database of the CRUDManager.
     */
    constructor(db: DataBaseSession<DBSchema>) { this.db = db; }
    public abstract get(...args: any[]): Promise<CRUDType | null>;
    public abstract getAll(...args: any[]): Promise<CRUDType[]>;
    public abstract create(data: create): Promise<CRUDType>;
    public abstract update(...args: any[]): Promise<CRUDType>;
    public abstract delete(...args: any[]): Promise<void>;

    protected abstract operationGet(db: DataBase<DBSchema>, collection: Collection<DBSchema, any>, ...args: any[]): Promise<CRUDType[]>;
    protected abstract operationUpdate(db: DataBase<DBSchema>, collection: Collection<DBSchema, any>, ...args: any[]): Promise<CRUDType>;
    protected abstract operationCreate(db: DataBase<DBSchema>, collection: Collection<DBSchema, any>, ...args: any[]): Promise<CRUDType>;
    protected abstract operationDelete(db: DataBase<DBSchema>, collection: Collection<DBSchema, any>, ...args: any[]): Promise<void>;
}
export namespace CRUDManager {
    export import CRUDObject = _CRUDObject;
    export interface DBSchema {
        [collection: string]: Schema<any>
    }
}
export default CRUDManager;