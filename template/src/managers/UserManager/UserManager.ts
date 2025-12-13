import { randomUUID } from "crypto";

import { CollectionSession, Schema } from "../../db-manager/Manager";

import User from "./User.js";

import { user } from "../../config/dbSchema.js";
import debug from "../../config/debug.js";

import Auth from "../../helpers/Auth.js";
import Avatar from "../../helpers/Avatar.js";

export class UserManager {
    public constructor(
        public readonly collection: CollectionSession<{
            user: typeof user;
            [Key: string]: Schema<any>
        }, 'user'>,
    ) {}
    
    public async getUserById(uuid: string): Promise<User | null> {
        return this.collection.operation(async (db, collection) => {
            const result = await collection.findOne({ _id: uuid });
            return result ? new User(this, result) : null;
        });
    }
    public async getUserByEmail(email: string): Promise<User | null> {
        return this.collection.operation(async (db, collection) => {
            const result = await collection.findOne({ 'email.address': email });
            return result ? new User(this, result) : null;
        });
    }
    public async getUserByUsername(username: string): Promise<User | null> {
        return this.collection.operation(async (dn, collection) => {
            const result = await collection.findOne({ 'profile.username': username });
            return result ? new User(this, result) : null;
        });
    }
    public async getUsers(page: number, limit: number): Promise<User[]> {
        const skip = (page - 1) * limit;
        const result = await this.collection.operation(async (db, collection) => {
            return await collection.aggregate<User.data>([
                { $match: {} },
                { $skip: skip },
                { $limit: limit },
            ]);
        });
        return result.map((document) => new User(this, document));
    }
    public async createUser(data: User.newUser): Promise<User | string> {
        /* Checking if the username is already in use */
        const error = await this.collection.operation(async (db, collection) => {
            const existingUser = await collection.findOne({ 'profile.username': data.username });
            if (existingUser) return 'api.auth.register.register.username-already-exists';
            return null;
        });
        if (error) return error;
        /* Creating an uuid for the user */
        const uuid: string = await this.collection.operation(async (db, collection) => {
            let uuid = randomUUID();
            let valid = false;
            do {
                const info = await collection.findOne({ _id: uuid });
                if (!info) valid = true;
                else uuid = randomUUID();
            } while (!valid);
            return uuid;
        });
        /* Encrypting the password */
        const salt = Auth.authSalt();
        const hash = Auth.encryptPassword(data.password, salt);
        /** saving avatar */
        let avatar: string | null = null;
        if (data.avatar != null) {
            try {
                const avatarID = await Avatar.save(uuid, data.avatar);
                avatar = Avatar.getUrl(uuid, avatarID);
            } catch (error) {
                debug.error(error);
                return 'api.auth.register.avatar-error';
            }
        }

        return this.collection.transaction(async (db, collection) => {
            await collection.insertOne({
                _id: uuid,
                profile: {
                    username: data.username,
                    name: data.name,
                    bio: data.bio,
                    avatar: avatar ? avatar : undefined,
                    phone: data.phone,
                    address: data.address,
                },
                permissions: {},
                email: { address: data.email },
                auth: { passwordHash: hash, passwordSalt: salt }
            });
            const user = await collection.findOne({ _id: uuid });
            if (!user) throw new Error('could not create user');
            return new User(this, user);
        });
    }
    public isValidUsernames(username: string): UserManager.validatorResponse {
        if (username.length < 3) return { valid: false, reason: 'username is too short' };
        if (username.length > 20) return { valid: false, reason: 'username is too long' };
        if (!/^[a-zA-Z0-9_]+$/.test(username)) return { valid: false, reason: 'username contains invalid characters' };
        return { valid: true };
    }
    public isValidPassword(password: string): UserManager.validatorResponse {
        if (password.length < 8) return { valid: false, reason: 'password is too short' };
        if (password.length > 100) return { valid: false, reason: 'password is too long' };
        // if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return { valid: false, reason: 'password must contain at least one lowercase letter' };
        return { valid: true };
    }
    public isValidEmails(email: string): UserManager.validatorResponse {
        if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) return { valid: false, reason: 'email is invalid' };
        return { valid: true };
    }
    public isValidName(name: string): UserManager.validatorResponse {
        if (name.length < 3) return { valid: false, reason: 'name is too short' };
        if (name.length > 100) return { valid: false, reason: 'name is too long' };
        return { valid: true };
    }
    public isValidPhone(phone: string): UserManager.validatorResponse {
        if (!/^\d{10}$/.test(phone)) return { valid: false, reason: 'phone is invalid' };
        return { valid: true };
    }
    public isValidBio(bio: string): UserManager.validatorResponse {
        if (bio.length > 500) return { valid: false, reason: 'bio is too long, max 500 chars' };
        return { valid: true };
    }
}

export namespace UserManager {
    namespace validations {
        export interface validResponse {
            valid: true;
        }
        export interface invalidResponse {
            valid: false;
            reason: string;
        }
    }
    export type validatorResponse = validations.validResponse | validations.invalidResponse;
}

export default UserManager;