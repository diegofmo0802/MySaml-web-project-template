import { ServerError } from 'saml.servercore';

import userManager from 'config/userManager.js';
import { getPaginationAsserts, isLoggedInAsserts } from 'config/middleware.js';

import Avatar from 'helper/Avatar.js';

import RequestManager from 'managers/RequestManager.js';
import User from 'managers/UserManager/User.js';

export async function getAvatar(apiRequest: RequestManager) {
    const { uuid, avatarID } = apiRequest.ruleParams;
    if (uuid == null) throw new ServerError('missing argument uuid', 400);
    if (avatarID == null) throw new ServerError('missing argument avatarID', 400);

    const avatar = await Avatar.get(uuid, avatarID);
    if (avatar == null) throw new ServerError('avatar not found', 404);

    apiRequest.sendCustom(avatar);
}

export async function getUser(apiRequest: RequestManager) {
    const { uuid } = apiRequest.ruleParams;
    if (uuid == null) throw new ServerError('missing argument uuid', 400);
    
    const user = await userManager.getById(uuid);
    if (user == null) throw new ServerError('user not found', 404);

    apiRequest.send(user.publicData);
}


export async function getUsers(apiRequest: RequestManager) {
    getPaginationAsserts(apiRequest.state);
    const { page, limit } = apiRequest.state;

    const result = await userManager.getAll(page, limit);
    const users = result.map(user => user.publicData);
    apiRequest.send({ page, limit, count: users.length, users });
}

export async function editUser(apiRequest: RequestManager) {
    isLoggedInAsserts(apiRequest.state);
    const { loggedUser } = apiRequest.state;
    const { uuid } = apiRequest.ruleParams;
    if (uuid == null) throw new ServerError('missing argument uuid', 400);

    const body = await apiRequest.post;
    if (body.mimeType !== 'multipart/form-data') throw new ServerError('unsupported mime type for this endpoint', 400);

    const user = loggedUser._id == uuid ? loggedUser : await userManager.getById(uuid);
    if (user == null) throw new ServerError('user not found', 404);

    const { username, name, bio, email, password, rmAvatar = false } = body.content
    const { avatar } = body.files;

    const profile: User.update['profile'] = {};
    const emailUpdate: User.update['email'] = {};
    const authUpdate: User.update['auth'] = {};

    if (username) profile.username = username;
    if (name) profile.name = name;
    if (bio) profile.bio = bio;
    if (email) emailUpdate.address = email;
    if (password) authUpdate.password = password;
    if (rmAvatar) profile.avatar = undefined;
    else if (avatar) profile.avatar = avatar;

    const update: User.update = {};
    if (Object.keys(profile).length > 0) update.profile = profile;
    if (Object.keys(emailUpdate).length > 0) update.email = emailUpdate;
    if (Object.keys(authUpdate).length > 0) update.auth = authUpdate;
    if (Object.keys(update).length == 0) throw new ServerError('no update provided', 400);
    
    await user.update(update);
    apiRequest.send(user.publicData);
}