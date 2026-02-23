import type ServerCore from 'saml.servercore';

import type User from './User.js';

export class Profile implements Profile.data {
    public constructor(
        private user: User,
        private data: Profile.data
    ) {}
    public get username(): string { return this.data.username; }
    public get name(): string | null | undefined { return this.data.name; }
    public get bio(): string | null | undefined { return this.data.bio; }
    public get avatar(): string | undefined { return this.data.avatar; }
    public get phone(): string | null | undefined { return this.data.phone; }
    public get address(): string | null | undefined { return this.data.address; }
    /**
     * Updates a profile.
     * @param data The data to update.
     * @returns The updated profile.
     */
    public async update(data: Profile.update): Promise<void> {
        await this.user.update({ profile: data });
        this.data = this.user.profile.data;
    }
    /**
     * Returns the data of the profile.
     * @returns The data of the profile.
     */
    public toJSON() { return this.data; }
}
export namespace Profile {
    export type data = User.data['profile'];
    export type update = Omit<data, 'avatar'> & {
        avatar: ServerCore.Request.BodyParser.Body.File | null;
    };
}
export default Profile;