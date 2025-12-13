import userManager from '../config/userManager.js';
import debug from '../config/debug.js';

import Avatar from '../helpers/Avatar.js';
import Image from '../helpers/Image.js';

import RequestManager from '../managers/RequestManager.js';

export async function getAvatar(apiRequest: RequestManager) {
    const { uuid, avatarID } = apiRequest.ruleParams;
    if (uuid == null || avatarID == null) return void apiRequest.sendError('missing arguments', 400);
    const path = Avatar.getPath(uuid, avatarID);
    const avatar = await Avatar.get(uuid, avatarID);
    if (avatar == null) return void apiRequest.sendError('avatar not found', 404);
    return apiRequest.sendCustom(avatar);
}

export async function getUser(apiRequest: RequestManager) {
    const { uuid } = apiRequest.ruleParams;
    if (uuid == null) return void apiRequest.sendError('missing arguments', 400);
    const user = await userManager.getUserById(uuid);
    if (user == null) return void apiRequest.sendError('user not found', 404);
    return apiRequest.send(user.publicData);
}


export async function getUsers(apiRequest: RequestManager) {
    const pageParam = apiRequest.ruleParams.Page ?? apiRequest.searchParams.page;
    const limitParam = apiRequest.searchParams.limit;
    if (!pageParam) return void apiRequest.sendError('no page provided');
    if (!limitParam) return void apiRequest.sendError('no limit provided');
    const page = parseInt(pageParam);
    const limit = parseInt(limitParam);
    if (isNaN(page) || isNaN(limit)) return void apiRequest.sendError('invalid page or limit');
    if (page < 1) return void apiRequest.sendError('page must be greater than 0');
    if (limit < 1) return void apiRequest.sendError('limit must be greater than 0');
    const result = await userManager.getUsers(page, limit);
    const users = result.map(user => user.publicData);
    apiRequest.send({ page, limit, count: users.length, users });
}

export async function editUser(apiRequest: RequestManager) {
    const session = apiRequest.session;
    if (session == null || session.valid == false) return apiRequest.unAuthorized();
    const loggedUser = await userManager.getUserById(session.content.uuid);
    if (loggedUser == null) return apiRequest.unAuthorized();

    const { uuid } = apiRequest.ruleParams;
    if (uuid == null) return void apiRequest.sendError('missing arguments', 400);
    if (!loggedUser.permissions.admin && loggedUser._id != uuid) return apiRequest.unAuthorized();

    const body = await apiRequest.post;
    if (body.mimeType !== 'multipart/form-data') return void apiRequest.sendError('no body provided', 400);
    const user = loggedUser._id == uuid ? loggedUser : await userManager.getUserById(uuid);
    if (user == null) return void apiRequest.sendError('user not found', 404);
    /* Profile updates */
    const { username = null, name = null, bio = null } = body.content
    const { avatar = null } = body.files;
    console.log(avatar);
    if (username != null) {
        if (!userManager.isValidUsernames(username)) return void apiRequest.sendError('invalid username', 400);
        const existUser = await userManager.getUserByUsername(username);
        if (existUser != null) return void apiRequest.sendError('username already exists', 400);
        user.profile.username = username;
    }
    if (name != null) {
        if (!userManager.isValidName(name)) return void apiRequest.sendError('invalid name', 400);
        user.profile.name = ['', 'null'].includes(name) ? null : name;
    }
    if (bio != null) {
        if (!userManager.isValidBio(bio)) return void apiRequest.sendError('invalid bio', 400);
        user.profile.bio = ['', 'null'].includes(bio) ? null : bio;
    }
    if (avatar != null) {
        const MAX_SIZE = (1024 * 1024) * 4;
        if (avatar.size > MAX_SIZE) return void apiRequest.sendError('Avatar size is too big', 400);
        if (!Image.isImageFile(avatar.content, ['jpeg', 'jpg', 'png'])) return void apiRequest.sendError('Invalid avatar format', 400);
        try {
            const avatarID = await Avatar.save(uuid, avatar.content);
            const avatarUrl = Avatar.getUrl(uuid, avatarID);
            user.profile.avatar = avatarUrl;
        } catch (error) {
            debug.error(error);
            return 'api.auth.register.avatar-error';
        }
    }
    try {
        if (user.needUpdate()) await user.saveChanges();
        apiRequest.send(user.publicData);
    } catch(err) {
        debug.error(err);
        apiRequest.sendError('error updating user', 500);
    }
}