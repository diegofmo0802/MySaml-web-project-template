import Manager from '../db-manager/Manager.js';
import Schemas from './dbSchema.js';
import { database } from './env.js';

export const client = new Manager(database);
export const db = client.dbSession(database.name, Schemas);

await db.operation(async (db) => {
    await db.init(); return true;
});

export default db;