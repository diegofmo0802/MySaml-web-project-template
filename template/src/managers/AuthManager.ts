import { Beta } from 'saml.servercore';
import Auth from '../helpers/Auth.js';

export class AuthManager {
    public jwt: Beta.JwtManager;
    public constructor(jwt: Beta.JwtManager) {
        this.jwt = jwt;
    }
    /**
     * Encrypts a password with a random salt.
     * @param password - The password to encrypt.
     */
    public encryptPassword(password: string): AuthManager.passwordObject {
        const salt = Auth.authSalt();
        const hash = Auth.encryptPassword(password, salt);
        return { hash, salt };
    }
    /**
     * Validates a password against a hash and salt.
     * @param password - The password to validate.
     * @param hash - The hash to validate against.
     * @param salt - The salt to validate against.
     */
    public validatePassword(password: string, hash: string, salt: string): boolean {
        return Auth.comparePassword(password, hash, salt);
    }
    /**
     * Parses a session token and validates it.
     * @param token - The token to parse.
     */
    public parseSessionToken(token: string): AuthManager.Session {
        const result = this.jwt.parse(token);
        if (result.verify === false) return {
            valid: false, reason: 'the provided token is not valid'
        };
        const {
            uuid = undefined,
            expire = undefined
        } = result.body;
        if (uuid === undefined || expire === undefined || typeof uuid !== 'string' || typeof expire !== 'number') return {
            valid: false, reason: 'the provided token contains invalid data'
        };
        if (expire < Date.now()) return {
            valid: false, reason: 'the provided token has expired'
        };
        return { valid: true, content: { uuid, expire } };
    }
    public generateSessionToken(uuid: string, expire?: number): string {
        return this.jwt.sign({
            uuid,
            expire: expire ?? Date.now() + 1000 * 60 * 60 * 24 * 7
        });
    }
}
export namespace AuthManager {
    export interface passwordObject {
        hash: string;
        salt: string;
    }
    export interface SessionInfo {
        uuid: string;
        expire: number;
    }
    export interface validationResultSuccess {
        valid: true;
        content: SessionInfo
    }
    export interface validationResultFail {
        valid: false;
        reason: string;
    }
    export type Session = (
        validationResultSuccess | validationResultFail
    );
}
export default AuthManager;