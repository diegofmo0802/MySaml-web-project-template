import { pbkdf2Sync, randomBytes } from "crypto";

export class Auth {
    /**
     * encrypt the given password with the given salt.
     * @param password the password from the token.
     * @param salt the key from the token.
     * @returns the generated token with length of 256.
     */
    public static encryptPassword(password: string, salt: string): string {
        return pbkdf2Sync(password, salt, 1024, 128, 'SHA256').toString('hex');
    }
    /**
     * generate a random salt for the auth token.
     * @returns a random salt with length of 32.
     */
    public static authSalt(): string {
        return randomBytes(16).toString('hex');
    }
    /**
     * compare the given password with the given hash and salt.
     * @param password the password from the token.
     * @param hash the hash from the token.
     * @param salt the key from the token.
     * @returns true if the password matches the hash, false otherwise.
     */
    public static comparePassword(password: string, hash: string, salt: string): boolean {
        return this.encryptPassword(password, salt) === hash;
    }
}

export namespace Auth {}

export default Auth;