import type User from './User.js';

export class Auth implements Auth.data {
    public constructor(
        private user: User,
        private data: Auth.data
    ) {}
    public get passwordHash(): string { return this.data.passwordHash; }
    public get passwordSalt(): string { return this.data.passwordSalt; }
    /**
     * Updates a user.
     * @param data The data to update.
     * @returns The updated user.
     */
    public async update(data: Auth.update): Promise<void> {
        await this.user.update({ auth: data });
        this.data = this.user.auth;
    }
    /**
     * Returns the data of the user.
     * @returns The data of the user.
     */
    public async toJSON() { return this.data; }
}
export namespace Auth {
    export type data = User.data['auth'];
    export type update = Omit<data, 'passwordHash' | 'passwordSalt'> & {
        password: string;
    }
}
export default Auth;