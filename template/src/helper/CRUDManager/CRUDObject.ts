import type CRUDManager from './CRUDManager.js';

export abstract class CRUDObject<
    DBSchema extends CRUDManager.DBSchema,
    data extends object,
    create extends object,
    update extends object,
    manager extends CRUDManager<DBSchema, data, create, update, any>
> {
    protected manager: manager;
    protected data: data;
    /**
     * Create a new CRUDObject.
     * @param manager - The manager of the CRUDObject.
     * @param data - The data of the CRUDObject.
     */
    constructor(manager: manager, data: data) {
        this.manager = manager;
        this.data = data;
    }
    /**
     * Update the data of the CRUDObject.
     * @param data - The data to update.
     */
    public abstract update(data: update): Promise<void>;
    /** Delete the CRUDObject. */
    public abstract delete(): Promise<void>;
    /**
     * Get the data of the CRUDObject.
     * @returns The data of the CRUDObject.
     */
    public abstract toJSON(): data;
}
export namespace CRUDObject {

}
export default CRUDObject;