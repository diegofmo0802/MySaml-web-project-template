import { Schema } from 'DBManager/Manager.js';

export const user = new Schema({
    _id: { type: 'string', required: true, unique: true, minLength: 36, maxLength: 36 },
    profile: { type: 'object', required: true, schema: {
        username: { type: 'string', required: true, unique: true, minLength: 3, maxLength: 20 },
        name:     { type: 'string', nullable: true, default: null, minLength: 3, maxLength: 80 },
        bio:      { type: 'string', nullable: true, default: null, minLength: 10, maxLength: 500 },
        avatar:   { type: 'string', default: '/favicon.ico' },
        phone:    { type: 'string', nullable: true, default: null, minLength: 10, maxLength: 10 },
        address:  { type: 'string', nullable: true, default: null, minLength: 10, maxLength: 200 },
    } },
    email: { type: 'object', required: true, schema: {
        address:     { type: 'string', required: true, unique: true, minLength: 6, maxLength: 100 },
        verified:    { type: 'boolean', default: false },
        verifyToken: { type: 'string', nullable: true, default: null }
    } },
    auth: { type: 'object', required: true, schema: {
        verified:     { type: 'boolean', required: true, default: false },
        verifyToken:  { type: 'string', nullable: true },
        passwordHash: { type: 'string', required: true, minLength: 256, maxLength: 256 },
        passwordSalt: { type: 'string', required: true, minLength: 32, maxLength: 32 }
    } },
    permissions: { type: 'object', required: true, schema: {
        admin: { type: 'boolean', required: true, default: false },
        login: { type: 'boolean', required: true, default: true }
    } }
});

export const schemas = { user };
export type schemas = typeof schemas;
export default schemas;