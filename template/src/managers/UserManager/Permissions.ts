import type User from './User.js';

export class Permissions implements Permissions.data {
    public constructor(
        private user: User,
        private data: Permissions.data
    ) {}
    public get admin(): boolean { return this.data.admin; }
    public get login(): boolean { return this.data.login; }
    /**
     * Updates the permissions of the user.
     * @param data The data to update.
     * @returns The updated permissions.
     */
    public async update(data: Permissions.update): Promise<void> {
        const result = await this.user.update({ permissions: data });
        this.data = this.user.permissions.data;
    }
    /**
     * Returns the data of the permissions.
     * @returns The data of the permissions.
     */
    public toJSON() { return this.data; }
}
export namespace Permissions {
    export type data = User.data['permissions'];
    export type update = Partial<data>;
}
export default Permissions;