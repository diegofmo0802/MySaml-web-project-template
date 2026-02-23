import ServerCore from "saml.servercore";

const data = {
    title: 'MySaml project',
    style: '/client/styles/style.css',
    logic: '/client/logic/build/logic.js'
}

function sendMain(request: ServerCore.Request, response: ServerCore.Response) {
    response.sendTemplate('assets/app.html', data);
}

const clientRouter = new ServerCore.Router();

clientRouter.addAction('GET', '/', sendMain);
clientRouter.addAction('GET', '/app/*', sendMain);
clientRouter.addFolder('/client', 'client/');
clientRouter.addFile('/favicon.ico', 'assets/saml.png');

export default clientRouter;