import { randomUUID } from 'crypto';
import { Collection, Schema } from '../DBManager/Manager.js';
import schemas from 'config/dbScheme.js';

export class Operations {
    /**
     * Gets a new id.
     * -- To be used in transaction | operations --
     * @param collection The collection to get the id from.
     */
    public static async newID(collection: Operations.allCollections): Promise<string> {
        let uuid: string = randomUUID();
        let exist = false;
        do {
            const info = await collection.findOne({ _id: uuid });
            if (!info) exist = true;
            else uuid = randomUUID();
        } while (!exist);
        return uuid;
    }
}
export namespace Operations {
    type CollectionsFromSchemas = {
        [K in keyof schemas]: Collection<schemas, schemas[K]['schema']>
    }
    export type allCollections = CollectionsFromSchemas[keyof CollectionsFromSchemas];
}
export default Operations;