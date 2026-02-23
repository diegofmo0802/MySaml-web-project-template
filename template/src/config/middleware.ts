import ServerCore, { Router, ServerError } from 'saml.servercore';

import logger from './debug.js';
import userManager, { UserManager } from './userManager.js';

import RequestManager from 'managers/RequestManager.js';

/**
 * Shows a possible error in the console.
 * @param request The request that caused the error.
 * @param error The error to show.
 */
function possibleError(request: ServerCore.Request, error: unknown) {
    logger.warn('&C(255,180,220)╭─────────────────────────────────────────────');
    if (error instanceof Error) {
        logger.warn('&C(255,180,220)│  &C2Possible error detected');
        logger.warn(`&C(255,180,220)│  &C2error message: &C1${error.message}`);
        logger.warn(`&C(255,180,220)│  &C2request URL: &C4${request.method} &C2-> &C5${request.url}`);
        logger.warn(`&C2error stack: &C3${error.stack}`.split('\n').map(line => '&C(255,180,220)│  &C3' + line).join('\n'));
    } else logger.warn(`${error || 'Unknown error'}`.split('\n').map(line => '&C(255,180,220)│  &C3' + line).join('\n'));
    logger.warn('&C(255,180,220)╰─────────────────────────────────────────────');
}

/**
 * Middleware to handle api errors.
 * @param error The error to handle.
 * @param request The request that caused the error.
 */
export function errorHandler(error: unknown, request: ServerCore.Request, response: ServerCore.Response, next: Router.Middleware.next, state: Router.Middleware.State) {
    const apiRequest = new RequestManager(request, response, state);
    if (error instanceof ServerError) return void apiRequest.sendError(error.message, error.status);
    possibleError(request, error);
    if (error instanceof Error) return void apiRequest.sendError(error.message);
    return void apiRequest.sendError('Unknown error');
}
/**
 * Middleware to check if the user is logged in.
 * @param request The request to check.
 * @param response The response to send the error to.
 * @param next The next middleware to call.
 * @param state The state to add the user to.
 */
export async function isLoggedIn(request: ServerCore.Request, response: ServerCore.Response, next: Router.Middleware.next, state: Router.Middleware.State): Promise<void> {
    const apiRequest = new RequestManager(request, response, state);
    const session = apiRequest.session;
    if (!session) throw new ServerError('No session found', 401);
    if (!session.valid) throw new ServerError('Session is not valid', 401);
    const { uuid } = session.content;
    const user = await userManager.getById(uuid);
    if (!user) throw new ServerError('User not found', 401);
    state.loggedUser = user;
    return next();
}
/**
 * Asserts that the logged user is logged in.
 * @param state The state to check.
 */
export function isLoggedInAsserts(state: Router.Middleware.State): asserts state is typeof state & { loggedUser: UserManager.User } {
    if (!(state.loggedUser instanceof UserManager.User)) throw new Error('isLoggedIn Middleware not working');
}
/**
 * Middleware to check if the logged user is admin.
 * @param request The request to check.
 * @param response The response to send the error to.
 * @param next The next middleware to call.
 * @param state The state to add the user to.
 * -- Dependencies
 * - isLoggedIn
 */
export async function isAdmin(request: ServerCore.Request, response: ServerCore.Response, next: Router.Middleware.next, state: Router.Middleware.State): Promise<void> {
    isLoggedInAsserts(state);
    if (!state.loggedUser.permissions.admin) throw new ServerError('You are not admin', 403);
    return next();
}
/**
 * Middleware to check if the logged user is admin or same user in the url.
 * @param request The request to check.
 * @param response The response to send the error to.
 * @param next The next middleware to call.
 * @param state The state to add the user to.
 * -- Dependencies
 * - isLoggedIn
 */
export async function isAdminOrSmeUser(request: ServerCore.Request, response: ServerCore.Response, next: Router.Middleware.next, state: Router.Middleware.State): Promise<void> {
    isLoggedInAsserts(state);
    const { uuid } = request.ruleParams;
    if (!uuid) throw new ServerError('No uuid provided', 400);
    if (uuid !== state.loggedUser._id && !state.loggedUser.permissions.admin) throw new ServerError('You are not allowed to access this user', 403);
    return next();
}

/**
 * Middleware to get the pagination from the request.
 * @param request The request to get the pagination from.
 * @param response The response to send the pagination to.
 * @param next The next middleware to call.
 * @param state The state to add the pagination to.
 */
export async function getPagination(request: ServerCore.Request, response: ServerCore.Response, next: Router.Middleware.next, state: Router.Middleware.State): Promise<void> {
    const { page: pageString = '1', limit: limitString = '20' } = request.searchParams;
    const page = parseInt(pageString);
    const limit = parseInt(limitString);
    if (isNaN(page)) throw new ServerError('Page is not a number', 400);
    if (isNaN(limit)) throw new ServerError('Limit is not a number', 400);
    state.page = page;
    state.limit = limit;
    return next();
}
/**
 * Asserts that the pagination is working.
 * @param state The state to check.
 */
export function getPaginationAsserts(state: Router.Middleware.State): asserts state is typeof state & { page: number, limit: number } {
    if (typeof state.page !== 'number') throw new Error('getPagination Middleware not working');
    if (typeof state.limit !== 'number') throw new Error('getPagination Middleware not working');
}