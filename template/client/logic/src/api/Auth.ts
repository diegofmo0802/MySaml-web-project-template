import Utilities from './helpers/Utilities.js';
import User from './User.js';

export class Auth {
    public static BASE_URL = '/api/auth';
    /**
     * Logs in a user.
     * @param username The username of the user.
     * @param password The password of the user.
     * @returns The user.
     */
    public static async login(username: string, password: string): Promise<Utilities.Response<Auth.Response.Login>> {
        const url = Utilities.relativeUrl([this.BASE_URL, 'login']);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({ username, password }),
        });
        return await response.json();
    }
    /**
     * Registers a new user.
     * @param data The data of the user.
     * @returns The user.
     */
    public static async register(data: Auth.newUser): Promise<Utilities.Response<Auth.Response.Login>> {
        const formData = Utilities.objectToFormdata(data, {
            includedKeys: [
                'username', 'name', 'bio', 'avatar',
                'email', 'phone', 'address', 'password'
            ], nullValues: false, undefinedValues: false
        });

        const url = Utilities.relativeUrl([this.BASE_URL, 'register']);
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });
        return await response.json();
    }
    /**
     * Checks if the user is logged in.
     * @returns The user.
     */
    public static async check(): Promise<Utilities.Response<Auth.Response.Check>> {
        const url = Utilities.relativeUrl([this.BASE_URL, 'check']);
        const response = await fetch(url, {
            method: 'GET',
        });
        return await response.json();
    }
    /**
     * Logs out the user.
     * @returns The message.
     */
    public static async logout(): Promise<Utilities.Response<Auth.Response.Logout>> {
        const url = Utilities.relativeUrl([this.BASE_URL, 'logout']);
        const response = await fetch(url, {
            method: 'POST',
        });
        return await response.json();
    }
}
export namespace Auth {
    export namespace Response {
        export interface Login {
            user: User.visible;
            session: string;
        }
        export interface Check {
            session: string;
            user: User.visible;
        }
        export interface Logout {
            message: string;
        }
    }
    export interface newUser {
        username: string;
        name?: string;
        bio?: string;
        avatar?: File;
        email: string;
        phone?: string;
        address?: string;
        password: string;
    }
}
export default Auth;