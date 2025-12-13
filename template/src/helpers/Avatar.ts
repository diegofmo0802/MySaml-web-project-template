import { randomUUID } from "crypto";
import { promises as fs } from "fs";

import { Image } from "./Image.js";

export class Avatar {
    /**
     * Get the url of the avatar
     * @param userID - The id of the user
     * @param avatarID The id of the avatar
     * @returns - The url of the avatar
     */
    public static getUrl(userID: string, avatarID: string): string {
        return `/api/user/${userID}/avatar/${avatarID}`;
    }
    /**
     * Get the path of the avatar
     * @param userID - The id of the user
     * @param avatarID - The id of the avatar
     * @returns - The path of the avatar
     */
    public static getPath(userID: string, avatarID: string): string {
        return `.data/avatar/${userID}/${avatarID}`;
    }
    /**
     * Save the avatar of the user
     * @param userID - The id of the user
     * @param data - The data of the avatar
     * @returns - The id of the avatar
     * @throws - If the avatar cannot be saved
     */
    public static async save(userID: string, data: Buffer): Promise<string> {
        const avatarID = randomUUID();
        const path = Avatar.getPath(userID, avatarID);
        await Image.save(path, data);
        return avatarID;
    }
    /**
     * Get the avatar of the user
     * @param userID - The id of the user
     * @param avatarID - The id of the avatar
     * @returns - The avatar of the user
     */
    public static async get(userID: string, avatarID: string): Promise<Buffer | null> {
        const Path = Avatar.getPath(userID, avatarID);
        if (!await this.exist(userID, avatarID)) return null
        return fs.readFile(Path);
    }
    /**
     * Delete the avatar of the user
     * @param userID - The id of the user
     * @param avatarID - The id of the avatar
     * @throws - If the avatar cannot be deleted
     */
    public static async delete(userID: string, avatarID: string): Promise<void> {
        const Path = Avatar.getPath(userID, avatarID);
        if (!await this.exist(userID, avatarID)) return;
        await fs.rm(Path);
    }
    /**
     * Check if the avatar exists
     * @param userID - The id of the user
     * @param avatarID - The id of the avatar
     * @returns - True if the avatar exists, false otherwise
     */
    public static async exist(userID: string, avatarID: string): Promise<boolean> {
        const Path = Avatar.getPath(userID, avatarID);
        try { await fs.access(Path);
            return true;
        } catch(error) { return false; }
    }
}
export namespace Avatar {}
export default Avatar;