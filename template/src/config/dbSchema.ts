import { Schema } from '../db-manager/Manager.js';

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

export const style = new Schema({
    _id: { type: 'string', required: true, unique: true, minLength: 36, maxLength: 36 },
    name: { type: 'string', required: true, unique: true, maxLength: 80 },
    description: { type: 'string', nullable: true, default: null, maxLength: 500 },
});

export const product = new Schema({
    _id: { type: 'string', required: true, unique: true, minLength: 36, maxLength: 36 },
    style: { type: 'string', required: true, minLength: 36, maxLength: 36 },
    framing: { type: 'string', required: true, maxLength: 80 },
    price: { type: 'number', required: true, minimum: 0 },
});

export const preview = new Schema({
    _id: { type: 'string', required: true, unique: true, minLength: 36, maxLength: 36 },
    product: { type: 'string', required: true, minLength: 36, maxLength: 36 },
    url: { type: 'string', required: true },
});

export const schemas = { user, style, product, preview };
export default schemas;