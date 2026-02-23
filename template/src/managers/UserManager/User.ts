import type schemas from 'config/dbSchema.js';

import { CRUDObject } from 'helper/CRUDManager/CRUDManager.js';

import _Profile from './Profile.js';
import _Email from './Email.js';
import _Auth from './Auth.js';
import _Permissions from './Permissions.js';
import type UserManager from './UserManager.js';

export { Profile } from './Profile.js';
export { Email } from './Email.js';
export { Auth } from './Auth.js';
export { Permissions } from './Permissions.js';

export class User extends CRUDObject<schemas, User.data, User.create, User.update, UserManager> implements User.data {
    public profile: User.Profile;
    public email: User.Email;
    public auth: User.Auth;
    public permissions: User.Permissions;
    public constructor( manager: UserManager, data: User.data) { super(manager, data);
        this.profile = new User.Profile(this, data.profile);
        this.email = new User.Email(this, data.email);
        this.auth = new User.Auth(this, data.auth);
        this.permissions = new User.Permissions(this, data.permissions);
    }
    public get _id(): string { return this.data._id; }
    public get publicData(): User.publicData {
        const { auth, ...data } = this.data;
        return data;
    }
    /**
     * Updates a user.
     * @param data The data to update.
     * @returns The updated user.
     */
    public async update(data: User.update): Promise<void> {
        const result = await this.manager.update(this._id, data);
        this.data = result.data;
    }
    /** Deletes a user. */
    public async delete(): Promise<void> {
        await this.manager.delete(this._id);
    }
    /**
     * Returns the data of the user.
     * @returns The data of the user.
     */
    public toJSON() { return this.data; }
}
export namespace User {
    export import Profile = _Profile;
    export import Email = _Email;
    export import Auth = _Auth;
    export import Permissions = _Permissions;

    type PartialRecursive<T> = {
        [K in keyof T]?: T[K] extends object ? PartialRecursive<T[K]> : T[K];
    };
    export type data = schemas['user']['infer'];
    export type publicData = Omit<data, 'auth'>;
    export type updateData = PartialRecursive<Omit<data, '_id'>>;
    export type update = PartialRecursive<Omit<data, '_id' | 'auth' | 'profile'> & {
        auth: Auth.update,
        profile: Profile.update
    }>;
    export type create = {
        username: string;
        email: string;
        password: string;
        name?: string;
        bio?: string;
        phone?: string;
        avatar?: Buffer;
    };
}
export default User
