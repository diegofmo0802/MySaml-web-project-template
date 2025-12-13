import ServerCore from "saml.servercore";
import authManager from "../config/authManager.js";
import User from "../managers/UserManager/User.js";
import AuthManager from "managers/AuthManager.js";
import FS from "fs";

export class RequestManager {
    private sended: boolean = false;
    public constructor(
        public readonly request: ServerCore.Request,
        private readonly response: ServerCore.Response
    ) {}
    public get ruleParams(): ServerCore.Router.Rule.ruleParams { return this.request.ruleParams; }
    public get searchParams(): ServerCore.Request.SearchParams { return this.request.searchParams; }
    public get post(): Promise<ServerCore.Request.BodyParser.Body> { return this.request.post; }
    public get cookies(): ServerCore.Cookie { return this.request.cookies; }
    public get authToken(): string | null { return this.cookies.get('auth-token') ?? null; }
    public set authToken(token: string | null) {
        if (!token) { this.cookies.delete('auth-token'); return; }
        const info = authManager.parseSessionToken(token);
        this.cookies.set('auth-token', token, {
            secure: true, httpOnly: true, path: '/',
            expires: info.valid ? new Date(info.content.expire) : undefined
        });
    }
    public sendCustom(data: string | Buffer | FS.ReadStream, code: number = 200): void {
        if (this.sended) throw new Error("Response already sended");
        this.sended = true;
        this.response.send(data);
    }
    public send<result>(result: result, options: ServerCore.Response.options = {}): void {
        if (this.sended) throw new Error("Response already sended");
        const status = options.status ?? 200;
        this.sended = true;
        const data: RequestManager.response<result> = {
            success: true,
            code: status,
            result: result,
        };
        this.response.sendJson(data, { status: status, headers: options.headers });
    }
    public sendFile(path: string): void {
        if (this.sended) throw new Error("Response already sended");
        this.sended = true;
        this.response.sendFile(path);
    }
    public unAuthorized(message: string = 'Unauthorized'): void {
        this.sendError(message, 401);
    }
    public redirect(url: string): void {
        if (this.sended) throw new Error("Response already sended");
        this.sended = true;
        this.response.send('', { status: 302, headers: { location: url } });
    }
    public sendError(reason: string, code: number = 500): void {
        if (this.sended) throw new Error("Response already sended");
        this.sended = true;
        const data: RequestManager.error = {
            success: false,
            code: code,
            reason: reason,
        };
        this.response.sendJson(data, { status: code });
    }
    public validatePassword(user: User, password: string): boolean {
        return authManager.validatePassword(password, user.auth.passwordHash, user.auth.passwordSalt);
    }
    public generateSessionToken(user: User) {
        return authManager.generateSessionToken(user._id);
    }
    public get session(): AuthManager.Session | null {
        const token = this.authToken;
        if (token == null) return null;
        const info = authManager.parseSessionToken(token);
        if (!info.valid) return null;
        return info;
    }
}

export namespace RequestManager {
    interface outPut {
        log?: string[];
        code: number;
    }
    export interface response<result = any> extends outPut {
        success: true;
        result: result;
    }
    export interface error extends outPut {
        success: false;
        reason: string;
    }
    export type PostMime = (
        'application/x-www-form-urlencoded' |
        'multipart/form-data' |
        'application/json'
    );
}

export default RequestManager;