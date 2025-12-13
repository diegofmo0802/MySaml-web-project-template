import { randomBytes } from 'crypto';
import { Utilities } from 'saml.servercore';

const defaultDB = {
    DB_HOST: 'localhost',
    DB_USER: 'admin',
    DB_PASS: '',
    DB_NAME: 'art-folder'
};

const defaultSV = {
    SV_HOST: '0.0.0.0',
    SV_PORT: '3000'
}

const defaultJWT = {
    JWT_SECRET: randomBytes(68).toString('hex').toUpperCase()
}

const DB = Utilities.Env.loadSync('db.env', { defaultEnv: defaultDB });
const SV = Utilities.Env.loadSync('sv.env', { defaultEnv: defaultSV });
const JWT = Utilities.Env.loadSync('jwt.env', { defaultEnv: defaultJWT });

export const database = {
    host: DB.DB_HOST || defaultDB.DB_HOST,
    user: DB.DB_USER || defaultDB.DB_USER,
    pass: DB.DB_PASS || defaultDB.DB_PASS,
    name: DB.DB_NAME || defaultDB.DB_NAME
};

const PORT = process.env.PORT || SV.SV_PORT || defaultSV.SV_PORT;

export const server = {
    host: SV.SV_HOST || defaultSV.SV_HOST,
    port: Number.parseInt(PORT) || 3000
};

export const jwt = {
    secret: JWT.JWT_SECRET || defaultJWT.JWT_SECRET
};

export default { database, server, jwt };