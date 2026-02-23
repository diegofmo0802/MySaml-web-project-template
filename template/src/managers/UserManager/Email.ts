import type User from './User.js';

export class Email implements Email.data {
    public constructor(
        private user: User,
        private data: Email.data
    ) {}
    public get address(): string { return this.data.address; }
    public get verified(): boolean | undefined { return this.data.verified; }
    public get verifyToken(): string | null | undefined { return this.data.verifyToken; }
    /**
     * Updates a user.
     * @param data The data to update.
     * @returns The updated user.
     */
    public async update(data: Email.update): Promise<void> {
        await this.user.update({ email: data });
        this.data = this.user.email.data;
    }
    /**
     * Returns the data of the user.
     * @returns The data of the user.
     */
    public toJSON() { return this.data; }
}
export namespace Email {
    export type data = User.data['email'];
    export type update = Partial<data>;
}
export default Email;