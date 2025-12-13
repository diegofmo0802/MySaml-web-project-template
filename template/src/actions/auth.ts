import authManager from '../config/authManager.js';
import debug from '../config/debug.js';
import userManager from '../config/userManager.js';

import Image from '../helpers/Image.js';

import RequestManager from '../managers/RequestManager.js';
import User from '../managers/UserManager/User.js';

export async function login(apiRequest: RequestManager) {
    debug.log('executing login');
    debug.log('getting post data in mimetype json');
    const post = await apiRequest.post;
    if (post.mimeType !== 'application/json') return void apiRequest.sendError('Invalid mime type', 400);
    debug.log('getting post data in json');
    const {
        username, password
    } = await post.content;
    debug.log('checking if username and password are set');
    if (!username || !password) return void apiRequest.sendError('Invalid data', 400);
    const user = await userManager.getUserByUsername(username);
    debug.log('checking if user exists');
    if (!user) return void apiRequest.sendError('User not found', 404);
    debug.log('checking if password is valid');
    if (!user.permissions.admin && !user.permissions.login) return apiRequest.sendError('the user have`t permission to login', 401);
    if (!apiRequest.validatePassword(user, password)) return void apiRequest.sendError('Invalid password', 401);
    apiRequest.authToken = apiRequest.generateSessionToken(user);
    debug.log("before send response success");
    apiRequest.send({
        user: user.publicData,
        session: apiRequest.authToken
    });
}

export async function register(apiRequest: RequestManager) {
    /* Getting sended data from the request */
    const post = await apiRequest.post;
    if (post.mimeType !== 'multipart/form-data') return void apiRequest.sendError('Invalid mime type', 400);
    const {
        username, email, password, // user creation     - (required)
        name, bio, phone, address  // user profile data - (optional)
    } = post.content;
    const avatar = post.files.avatar; // user avatar     - (optional)
    /* Checking if all required data is sended */
    if (username == null) return void apiRequest.sendError('missing username', 400);
    if (email    == null) return void apiRequest.sendError('missing email', 400);
    if (password == null) return void apiRequest.sendError('missing password ', 400);
    /* Checking if the required data is valid */
    if (!userManager.isValidUsernames(username).valid) return void apiRequest.sendError('Invalid username', 400);
    if (!userManager.isValidEmails(email).valid)       return void apiRequest.sendError('Invalid email', 400);
    if (!userManager.isValidPassword(password).valid)  return void apiRequest.sendError('Invalid password', 400);
    /* Checking if the user already exists */
    if (await userManager.getUserByUsername(username) != null) return void apiRequest.sendError('User already exists', 409);
    if (await userManager.getUserByEmail(email) != null)       return void apiRequest.sendError('email already used', 409);
    /* checking if the avatar is valid to save */
    let avatarPath: string | null = null;
    let avatarID: string | null = null;
    let iconData: Buffer | null = null;
    if (avatar != null) {
        const MAX_SIZE = (1024 * 1024) * 4;
        if (avatar.size > MAX_SIZE) return void apiRequest.sendError('Avatar size is too big', 400);
        if (!Image.isImageFile(avatar.content, ['jpeg', 'jpg', 'png'])) return void apiRequest.sendError('Invalid avatar format', 400);
        iconData = avatar.content;
    }
    /* Creating newUser object */
    const newUser: User.newUser = { username, email, password, };
    if (name != null)     newUser.name = name;
    if (bio != null)      newUser.bio = bio;
    if (phone != null)    newUser.phone = phone;
    if (address != null)  newUser.address = address;
    if (iconData != null) newUser.avatar = iconData;
    /* Creating the new user */
    const user = await userManager.createUser(newUser);
    if (typeof user === 'string') return void apiRequest.sendError(user, 400);
    apiRequest.authToken = apiRequest.generateSessionToken(user);
    apiRequest.send({
        user: user.publicData,
        session: apiRequest.generateSessionToken(user)
    });
}

export async function logout(apiRequest: RequestManager) {
    if (!apiRequest.authToken) return void apiRequest.sendError('Not logged in', 401);
    apiRequest.authToken = null;
    apiRequest.send({ message: "session closed" });
}

export async function checkSession(apiRequest: RequestManager) {
    if (!apiRequest.authToken) return void apiRequest.sendError('Not logged in', 401);
    const info = authManager.parseSessionToken(apiRequest.authToken);
    if (!info.valid) return void apiRequest.sendError('Invalid session', 401);
    const user = await userManager.getUserById(info.content.uuid);
    if (!user) return void apiRequest.sendError('User not found', 404);
    if (!user.permissions.admin && !user.permissions.login) return apiRequest.sendError('the user have`t permission to login', 401);
    apiRequest.authToken = apiRequest.generateSessionToken(user);
    apiRequest.send({
        user: user.publicData,
        session: apiRequest.authToken
    });
}