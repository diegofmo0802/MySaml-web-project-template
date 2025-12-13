import ServerCore from "saml.servercore";

const Data = {
    title: 'MySaml project',
    style: '/client/styles/style.css',
    logic: '/client/logic/build/logic.js'
}

function sendMain(request: ServerCore.Request, response: ServerCore.Response) {
    response.sendTemplate('assets/app.html', Data);
}
export function clientRules(router: ServerCore.Router) {
    router.addAction('GET', '/', sendMain);
    router.addAction('GET', '/app/*', sendMain);

    router.addFolder('client', 'client');
    router.addFile('favicon.ico', 'assets/saml.png');
}
export default clientRules;