import { ServerError, Utilities } from 'saml.servercore';
import type { Collection, DataBase } from 'DBManager/Manager.js';

import Operations from 'helper/Operations.js';
import Avatar from 'helper/Avatar.js';
import Image from 'helper/Image.js';
import CRUDManager from 'helper/CRUDManager/CRUDManager.js';

import type schemas from 'config/dbScheme.js';
import authManager from 'config/authManager.js';

import _User from './User.js';
import type Email from './Email.js';
import type Auth from './Auth.js';
import type Profile from './Profile.js';

export { User } from './User.js';

export class UserManager extends CRUDManager<schemas, UserManager.User.data, UserManager.create, UserManager.User.update, UserManager.User>  {
    /**
     * Gets a user.
     * @param id The id of the user.
     * @returns The user.
     */
    public async get(id: string): Promise<UserManager.User> {
        return this.getById(id);
    }
    
    /**
     * Gets a user.
     * @param id The id of the user.
     * @returns The user.
     */
    public async getById(id: string): Promise<UserManager.User> {
        return this.db.collection('user').operation(async (db, collection) => {
            const result = await this.operationGet(db, collection, { _id: id });
            if (result.length === 0) throw new ServerError('User not found', 404);
            return result[0];
        });
    }
    /**
     * Get a user.
     * @param username The username of the user.
     * @returns The user.
     */
    public async getByUsername(username: string): Promise<UserManager.User> {
        return this.db.collection('user').operation(async (db, collection) => {
            const result = await this.operationGet(db, collection, { 'profile.username': username });
            if (result.length === 0) throw new ServerError('User not found', 404);
            return result[0];
        });
    }
    /**
     * Get a user.
     * @param email The email of the user.
     * @returns The user.
     */
    public async getByEmail(email: string): Promise<UserManager.User> {
        return this.db.collection('user').operation(async (db, collection) => {
            const result = await this.operationGet(db, collection, { 'email.address': email });
            if (result.length === 0) throw new ServerError('User not found', 404);
            return result[0];
        });
    }
    /**
     * Gets all users.
     * @param page The page to get.
     * @param limit The limit of the page.
     * @returns The users.
     */
    public async getAll(page: number = 1, limit: number = 10): Promise<UserManager.User[]> {
        if (page < 1) throw new ServerError('Page must be greater than 0', 400);
        if (limit < 1) throw new ServerError('Limit must be greater than 0', 400);
        const skip = (page - 1) * limit;
        return this.db.collection('user').operation(async (db, collection) => {
            const users = await collection.aggregate<UserManager.User.data>([
                { $match: {} },
                { $skip: skip },
                { $limit: limit },
            ]);
            return users.map((user) => new UserManager.User(this, user));
        });
    }
    /**
     * Create a new user.
     * @param data The data to create the user with.
     * @returns The created user.
     */
    public async create(data: UserManager.User.create): Promise<UserManager.User> {
        return this.db.collection('user').transaction(async (db, collection) => {
            return await this.operationCreate(db, collection, data);
        });
    }
    /**
     * Updates a user.
     * @param id The id of the user.
     * @param data The data to update.
     * @returns The updated user.
     */
    public async update(id: string, data: UserManager.User.update): Promise<UserManager.User> {
        return this.db.collection('user').transaction(async (db, collection) => {
            return await this.operationUpdate(db, collection, id, data);
        });
    }
    /**
     * Deletes a user.
     * @param id The id of the user.
     */
    public async delete(id: string): Promise<void> {
        return this.db.collection('user').transaction(async (db, collection) => {
            return await this.operationDelete(db, collection, id);
        });
    }
    /**
     * Get a user.
     * -- To use in transaction --
     * @param filter The filter to get the user with.
     * @returns The user.
     */
    public async operationGet(db: UserManager.db, collection: UserManager.collection, filter: Collection.Filter<schemas['client']['schema']> = {}, page: number = 1, limit: number = 10): Promise<UserManager.User[]> {
        const result = await db.collection('user').aggregate([
            { $match: filter },
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]);
        return result.map((user) => new UserManager.User(this, user));
    }
    /**
     * Creates a new user.
     * -- To use in transaction --
     * @param data The data to create the user with.
     * @returns The created user.
     */
    public async operationCreate(db: UserManager.db, collection: UserManager.collection, data: UserManager.create): Promise<UserManager.User> {
        try {
            UserManager.isValidUsername(data.username);
            UserManager.isValidPassword(data.password);
            UserManager.isValidEmails(data.email);
            if (data.name) UserManager.isValidName(data.name);
            if (data.phone) UserManager.isValidPhone(data.phone);
            if (data.bio) UserManager.isValidBio(data.bio);
        } catch (error) {
            if (error instanceof Error) throw new ServerError(error.message, 400);
            throw error;
        }

        let test = await this.operationGet(db, collection, { 'profile.username': data.username });
        if (test.length > 0) throw new ServerError('Username already in use', 409);
        test = await this.operationGet(db, collection, { 'email.address': data.email });
        if (test.length > 0) throw new ServerError('Email already in use', 409);

        const uuid = await Operations.newID(collection);
        const { salt, hash } = authManager.encryptPassword(data.password);

        const profile: Profile.data = {
            username: data.username,
            name: data.name,
            bio: data.bio,
            phone: data.phone
        };
        const email: Email.data = {
            address: data.email
        };
        const auth: Auth.data = {
            passwordHash: hash,
            passwordSalt: salt
        };

        let avatarID: string | undefined = undefined;
        if (data.avatar) {
            UserManager.isValidAvatar(data.avatar);
            avatarID = await Avatar.save(uuid, data.avatar);
            profile.avatar = Avatar.getUrl(uuid, avatarID);
        }

        try {
            await collection.insertOne({ _id: uuid, profile, email, auth, permissions: {} });
            const user = await collection.findOne({ _id: uuid });
            if (!user) throw new ServerError('Could not create user', 500);
            return new UserManager.User(this, user);
        } catch (error) {
            if (avatarID) await Avatar.delete(uuid, avatarID);
            throw error;
        }
    }
    /**
     * Updates a user.
     * -- To use in transaction --
     * @param id The id of the user.
     * @param data The data to update.
     * @returns The updated user.
     */
    public async operationUpdate(db: UserManager.db, collection: UserManager.collection, id: string, data: UserManager.User.update): Promise<UserManager.User> {
        const users = await this.operationGet(db, collection, { _id: id });
        if (users.length === 0) throw new ServerError('User not found', 404);
        const user = users[0];

        const profile: UserManager.User.updateData['profile'] = {};
        const email: UserManager.User.updateData['email'] = {};
        const auth: UserManager.User.updateData['auth'] = {};
        const permissions: UserManager.User.updateData['permissions'] = {};

        let avatarID: string | null = null;
        try {
            if (data.profile && Object.keys(data.profile).length > 0) {
                const { username, name, bio, phone, avatar, address } = data.profile;
                if (username && username !== user.profile.username) {
                    UserManager.isValidUsername(username);
                    const test = await this.operationGet(db, collection, { 'profile.username': username });
                    if (test.length > 0) throw new ServerError('Username already in use', 409);
                    profile.username = username;
                }
                if (name && name !== user.profile.name) {
                    UserManager.isValidName(name);
                    profile.name = name;
                } else if (name == 'null') profile.name = null;
                if (bio && bio !== user.profile.bio) {
                    UserManager.isValidBio(bio);
                    profile.bio = bio;
                } else if (bio == 'null') profile.bio = null;
                if (phone && phone !== user.profile.phone) {
                    UserManager.isValidPhone(phone);
                    profile.phone = phone;
                } else if (phone == 'null') profile.phone = null;
                if (avatar != null) {
                    UserManager.isValidAvatar(avatar);
                    avatarID = await Avatar.save(id, avatar);
                    profile.avatar = Avatar.getUrl(id, avatarID);
                } else if (avatar == null && user.profile.avatar != null) profile.avatar = undefined;
            }
            if (data.email && Object.keys(data.email).length > 0) {
                const { address, verified, verifyToken } = data.email;
                if (address && address !== user.email.address) {
                    UserManager.isValidEmails(address);
                    const test = await this.operationGet(db, collection, { 'email.address': address });
                    if (test.length > 0) throw new ServerError('Email already in use', 409);
                    email.address = address;
                    // NOTE: Email verification is not implemented yet
                    email.verified = false;
                    email.verifyToken = null;
                }
                if (verified != null) email.verified = verified;
                if (verifyToken != null) email.verifyToken = verifyToken;            
            }
            if (data.auth && Object.keys(data.auth).length > 0) {
                const { password } = data.auth;
                UserManager.isValidPassword(password);
                if (!authManager.validatePassword(password, user.auth.passwordHash, user.auth.passwordSalt)) {
                    const { salt, hash } = authManager.encryptPassword(password);
                    auth.passwordHash = hash;
                    auth.passwordSalt = salt;
                }
            }
            if (data.permissions && Object.keys(data.permissions).length > 0) {
                for (const [key, value] of Object.entries(data.permissions)) {
                    if (key in user.permissions) permissions[key as keyof UserManager.User.data['permissions']] = value;
                }
            }
        } catch (error) {
            if (error instanceof Error) throw new ServerError(error.message, 400);
            throw error;
        }

        const update: UserManager.User.updateData = {};
        if (Object.keys(profile).length > 0) update.profile = profile;
        if (Object.keys(email).length > 0) update.email = email;
        if (Object.keys(auth).length > 0) update.auth = auth;
        if (Object.keys(permissions).length > 0) update.permissions = permissions;

        const set = Utilities.flattenObject(update);
        const unset: { [key: string]: true } = {};

        for (const key in set) {
            const value = set[key as keyof typeof set];
            if (value !== undefined) continue;
            unset[key] = true;
            delete set[key as keyof typeof set];
        }
        try {
            await collection.updateOne({ _id: id }, { $set: set, $unset: unset });
            const updatedUser = await collection.findOne({ _id: id });
            if (!updatedUser) throw new ServerError('Could not update user', 500);
            return new UserManager.User(this, updatedUser);
        } catch (error) {
            if (avatarID) await Avatar.delete(id, avatarID);
            throw error;
        }
    }
    /**
     * Deletes a user.
     * -- To use in transaction --
     * @param id The id of the user.
     */
    public async operationDelete(db: UserManager.db, collection: UserManager.collection, id: string): Promise<void> {
        await collection.deleteOne({ _id: id });
    }
    /**
     * Validates a username.
     * @param username The username to validate.
     * @throws If the username is invalid.
     */
    public static isValidUsername(username: unknown): asserts username is string {
        if (!username) throw new Error('Username is required');
        if (typeof username !== 'string') throw new Error('Username must be a string');
        if (username.length < 3 || username.length > 20) throw new Error('Username must be between 3 and 20 characters');
        if (!/^[a-zA-Z0-9_]+$/.test(username)) throw new Error('Username can only contain letters, numbers, and underscores');
    }
    /**
     * Validates a password.
     * @param password The password to validate.
     * @throws If the password is invalid.
     */
    public static isValidPassword(password: unknown): asserts password is string {
        if (!password) throw new Error('Password is required');
        if (typeof password !== 'string') throw new Error('Password must be a string');
        if (password.length < 8 || password.length > 100) throw new Error('Password must be between 8 and 100 characters');
        // if (!/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/.test(password)) throw new Error('password must contain at least one lowercase letter');
    }
    /**
     * Validates an email.
     * @param email The email to validate.
     * @throws If the email is invalid.
     */
    public static isValidEmails(email: unknown): asserts email is string {
        if (!email) throw new Error('Email is required');
        if (typeof email !== 'string') throw new Error('Email must be a string');
        if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) throw new Error('Email format is invalid');
    }
    public static isValidAvatar(avatar: unknown): asserts avatar is Buffer {
        if (!avatar) throw new Error('Avatar is required');
        if (
            typeof avatar !== 'object' ||
            !('size' in avatar) ||
            !('name' in avatar) ||
            !('mimeType' in avatar) ||
            !('content' in avatar) ||
            typeof avatar.size !== 'number' ||
            typeof avatar.name !== 'string' ||
            typeof avatar.mimeType !== 'string' ||
            !(avatar.content instanceof Buffer)
        ) throw new Error('Avatar must be a file object');
        const MAX_SIZE = (1024 * 1024) * 4;
        if (avatar.size > MAX_SIZE) throw new Error('Avatar size cannot exceed 4MB');
        if (!Image.isImageFile(avatar.content, ['jpeg', 'jpg', 'png'])) throw new Error('Invalid avatar format. Only jpeg, jpg, and png are allowed.');
    }
    /**w
     * Validates a name.
     * @param name The name to validate.
     * @throws If the name is invalid.
     */
    public static isValidName(name: unknown): asserts name is string {
        if (!name) throw new Error('Name is required');
        if (typeof name !== 'string') throw new Error('Name must be a string');
        if (name.length < 3 || name.length > 100) throw new Error('Name must be between 3 and 100 characters');
    }
    /**
     * Validates a phone.
     * @param phone The phone to validate.
     * @throws If the phone is invalid.
     */
    public static isValidPhone(phone: unknown): asserts phone is string {
        if (!phone) throw new Error('Phone number is required');
        if (typeof phone !== 'string') throw new Error('Phone number must be a string');
        if (!/^\d{10}$/.test(phone)) throw new Error('Phone number format is invalid. It must be 10 digits.');
    }
    /**
     * Validates a bio.
     * @param bio The bio to validate.
     * @throws If the bio is invalid.
     */
    public static isValidBio(bio: unknown): asserts bio is string {
        if (!bio) throw new Error('Bio is required');
        if (typeof bio !== 'string') throw new Error('Bio must be a string');
        if (bio.length < 10 || bio.length > 500) throw new Error('Bio must be between 10 and 500 characters');
    }
}
export namespace UserManager {
    export import User = _User;

    export type collection = Collection<schemas, schemas['user']['schema']>;
    export type db = DataBase<schemas>;
    export type create = {
        username: string;
        email: string;
        password: string;
        name?: string;
        bio?: string;
        phone?: string;
        address?: string;
        avatar?: Buffer;
    };
}
export default UserManager;
