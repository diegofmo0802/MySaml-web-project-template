import ServerCore, { ServerError } from "saml.servercore";

import RequestManager from "managers/RequestManager.js";

import * as middleware from "config/middleware.js";

import * as authRule from "../actions/auth.js";
import * as userRule from "../actions/user.js";

function createAction(rule: (rm: RequestManager) => Promise<void>) {
    return (request: ServerCore.Request, response: ServerCore.Response, state: ServerCore.Router.Middleware.State) => {
        return rule(new RequestManager(request, response, state));
    };
}

/* Definition of public routes */
const apiRouter = new ServerCore.Router();
apiRouter.httpMiddleware.useError(middleware.errorHandler);

apiRouter.addAction('POST', '/auth/login', createAction(authRule.login));
apiRouter.addAction('POST', '/auth/register', createAction(authRule.register));

apiRouter.addAction('GET', '/user', createAction(userRule.getUsers)).use(middleware.getPagination);
apiRouter.addAction('GET', '/user/$uuid', createAction(userRule.getUser));
apiRouter.addAction('GET', '/user/$uuid/avatar/$avatarID', createAction(userRule.getAvatar));

/* Definition of routes that require authentication */
const sessionRouter = apiRouter.createRouter();
sessionRouter.httpMiddleware.use(middleware.isLoggedIn);

sessionRouter.addAction('GET', '/auth/check', createAction(authRule.checkSession));
sessionRouter.addAction('POST', '/auth/logout', createAction(authRule.logout));
sessionRouter.addAction('POST', '/user/$uuid', createAction(userRule.editUser)).use(middleware.isAdminOrSmeUser);

apiRouter.mount(sessionRouter);

// All other routes
apiRouter.addAction('GET', '/*', (request, response, state) => {
    throw new ServerError(`No router fount to ${request.method} -> ${request.url}`, 404);
});

export default apiRouter;