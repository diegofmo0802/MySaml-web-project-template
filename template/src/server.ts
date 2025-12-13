import './config/env.js';
import ServerCore from 'saml.servercore';

import env from './config/env.js';
import clientRules from './clientRules.js';
import serverRules from './serverRules.js';

const server = new ServerCore({
    host: env.server.host,
    port: env.server.port
});

clientRules(server.router);
serverRules(server.router);

server.start();

const debugUI = new ServerCore.DebugUI(server);
debugUI.start();