import ServerCore from "saml.servercore";

import RequestManager from "./managers/RequestManager.js";
import * as authRule from "./actions/auth.js";
import * as userRule from "./actions/user.js";

function route(rule: string): string {
    rule = rule.startsWith('/') ? rule.slice(1) : rule;
    return `/api/${rule}`;
}

export function serverRules(router: ServerCore.Router): void {
    // Auth rules/session
    router.addAction('POST', route('auth/login'), (request, response) => {
        authRule.login(new RequestManager(request, response));
    });
    router.addAction('POST', route('auth/register'), (request, response) => {
        authRule.register(new RequestManager(request, response));
    });
    router.addAction('POST', route('auth/logout'), (request, response) => {
        authRule.logout(new RequestManager(request, response));
    });
    router.addAction('GET', route('auth/check'), (request, response) => {
        authRule.checkSession(new RequestManager(request, response));
    });
    // User rules/Profile
    router.addAction('GET', route('/user'), (request, response) => {
        userRule.getUsers(new RequestManager(request, response));
    });
    router.addAction('GET', route('/user/$uuid'), (request, response) => {
        userRule.getUser(new RequestManager(request, response));
    });
    router.addAction('GET', route('/user/$uuid/avatar/$avatarID'), (request, response) => {
        userRule.getAvatar(new RequestManager(request, response));
    });
    router.addAction('POST', route('/user/$uuid'), (request, response) => {
        userRule.editUser(new RequestManager(request, response));
    });
}
export default serverRules;