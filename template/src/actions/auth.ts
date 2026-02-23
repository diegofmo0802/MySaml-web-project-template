import { ServerError } from 'saml.servercore';

import authManager from 'config/authManager.js';
import userManager, { UserManager } from 'config/userManager.js';

import * as middleware from 'config/middleware.js';

import RequestManager from 'managers/RequestManager.js';
import User from 'managers/UserManager/User.js';

export async function login(apiRequest: RequestManager){
    const body = await apiRequest.post;
    if (
        body.mimeType !== 'application/json' &&
        body.mimeType !== 'application/x-www-form-urlencoded' &&
        body.mimeType !== 'multipart/form-data'
    ) throw new ServerError('unsupported mime type for this endpoint', 400);
    const { username = null, password = null } = body.content;
    if (!username) throw new ServerError('username is required', 400);
    if (!password) throw new ServerError('password is required', 400);
    const user = await userManager.getByUsername(username);
    if (!user) throw new ServerError('user not found', 404);
    if (!apiRequest.validatePassword(user, password)) throw new ServerError('invalid password', 401);
    apiRequest.authToken = apiRequest.generateSessionToken(user);
    apiRequest.send({
        user: user.publicData,
        session: apiRequest.authToken
    });
}

export async function register(apiRequest: RequestManager){
    const body = await apiRequest.post;
    const { username, email, password } = body.content;
    try {
        UserManager.isValidUsername(username);
        UserManager.isValidPassword(password);
        UserManager.isValidEmails(email);
    } catch (error) {
        if (error instanceof Error) throw new ServerError(error.message, 400);
        else throw error;
    }
    const creation: User.create = { username, email, password };

    let test = await userManager.getByUsername(username);
    if (test) throw new ServerError('username already in use', 409);
    test = await userManager.getByEmail(email);
    if (test) throw new ServerError('email already in use', 409);

    const { bio, name, phone } = body.content;
    const { avatar } = body.files || {};

    if (bio) creation.bio = bio;
    if (name) creation.name = name;
    if (phone) creation.phone = phone;
    if (avatar) creation.avatar = avatar.content;

    const user = await userManager.create(creation);
    const authToken = apiRequest.generateSessionToken(user);
    apiRequest.send({
        user: user.publicData,
        session: authToken
    });
}

export async function logout(apiRequest: RequestManager){
    middleware.isLoggedInAsserts(apiRequest.state);
    apiRequest.authToken = null;
    apiRequest.send({ message: "session closed" });
}

export async function checkSession(apiRequest: RequestManager) {
    middleware.isLoggedInAsserts(apiRequest.state);
    const user = apiRequest.state.loggedUser;
    if (!user.permissions.admin && !user.permissions.login) throw new ServerError('Not authorized', 403);
    apiRequest.authToken = apiRequest.generateSessionToken(user);
    apiRequest.send({
        user: user.publicData,
        session: apiRequest.authToken
    });
}