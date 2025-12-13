import { Utilities } from "saml.servercore";
import { user } from "../../config/dbSchema.js";
import UserManager from "./UserManager.js";

export class User implements User.data {
    public readonly _id: string;
    protected readonly userManager: UserManager;
    protected _profile!: User.profile;
    protected _email!: User.email;
    protected _auth!: User.auth;
    protected _permissions!: User.Permission;
    public toUpdate!: User.updateData;
    public constructor(userManager: UserManager, data: User.data) {
        this.userManager = userManager;
        this._id = data._id;
        this.setData(data);
    }
    /**
     * Set data for the user.
     * @param data - The data to set.
     */
    protected setData(data: User.data): void {
        this._profile = this.makeProxy('profile', data.profile);
        this._email = this.makeProxy('email', data.email);
        this._auth = this.makeProxy('auth', data.auth);
        this._permissions = this.makeProxy('permissions', data.permissions);
        this.toUpdate = {};
    }
    public get profile(): User.profile { return this._profile; }
    public get auth(): User.auth { return this._auth; }
    public get email(): User.email { return this._email; }
    public get permissions(): User.Permission { return this._permissions; }
    public set profile(profile: Partial<User.profile>) { this.toUpdate.profile = profile; }
    public set auth(auth: Partial<User.auth>) { this.toUpdate.auth = auth; }
    public set email(email: Partial<User.email>) { this.toUpdate.email = email; }
    public set permissions(permissions: Partial<User.Permission>) { this.toUpdate.permissions = permissions; }
    public get publicData(): User.publicData {
        const { _id, profile, email, permissions } = this;
        return { _id, profile, email, permissions };
    }
    /**
     * Check if there are any changes to the database.
     * @returns true if there are changes, false otherwise.
     */
    public needUpdate(): boolean { return Object.keys(this.toUpdate).length > 0; }
    /**
     * Cancel changes to the database.
     */
    public cancelChanges(): void { this.toUpdate = {}; }
    /**
     * Save changes to the database.
     * @throws Error if user not found or failed to update.
     */
    public async saveChanges(): Promise<this> {
        if (!this.needUpdate()) return this;
        return await this.userManager.collection.transaction(async (db, collection) => {
            const toUpdate = Utilities.flattenObject(this.toUpdate);
            const update = await collection.updateOne({ _id: this._id }, { $set: toUpdate });
            const newData = await collection.findOne({ _id: update.upsertedId ?? this._id });
            if (!newData) throw new Error('User not found');
            this.setData(newData);
            return this;
        });
    }
    /**
     * Wrap an object in a proxy to detect property changes and track updates.
     * @param key - The key associated with the update.
     * @param value - The object to wrap in a proxy.
     * @returns A proxied version of the object.
     */
    private makeProxy<T extends object>(key: keyof User.updateData, value: T): T {
        const self = this;
        return new Proxy(value, {
            set(target, prop: string, value) {
                const current = target[prop as keyof T];
                if (current !== value) {
                    target[prop as keyof T] = value;
                    if (!self.toUpdate[key] && key !== '_id') self.toUpdate[key] = {};
                    (self.toUpdate[key] as any)[prop] = value;
                }
                return true;
            }
        });
    }
}
export namespace User {
    type PartialRecursive<T> = {
        [K in keyof T]?: T[K] extends object ? PartialRecursive<T[K]> : T[K];
    };
    export type publicData = Omit<data, 'auth'>;
    export type data = typeof user.infer;
    export type profile = data['profile'];
    export type email = data['email'];
    export type auth = data['auth'];
    export type Permission = data['permissions'];
    export type updateData = PartialRecursive<data>;
    export interface newUser {
        username: string;
        name?: string;
        bio?: string;
        avatar?: Buffer;
        email: string;
        phone?: string;
        address?: string;
        password: string;
    }
}
export default User;