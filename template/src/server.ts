import ServerCore from 'saml.servercore';

import env from 'config/env.js';
import clientRouter from './routers/clientRouter.js';
import apiRouter from './routers/apiRouter.js';

const config = await ServerCore.Config.Loader.load('.config.json', {
    host: env.server.host, port: env.server.port
});

const server = new ServerCore(config);
/// const server = new ServerCore({ port: 3000 });

server.router.mount(clientRouter);
server.router.mount(apiRouter, '/api');

const debugUI = new ServerCore.ServerDebug(server);
debugUI.addCommand('rules', function() {
    this.out.info('&C(255,180,220)╭─────────────────────────────────────────────');
    this.out.info('&C(255,180,220)│ &C2 Rules added to server router');
    this.out.info('&C(255,180,220)├─────────────────────────────────────────────');
    for (const rule of server.router.httpRules) {
        this.out.info(`&C(255,180,220)│  &C3http rule: &C2${rule.method.padStart(6, ' ')} &R-> &C6${rule.urlRule}`);
        this.out.info(`&C(255,180,220)│   &R exp: &C2${rule.expression}`);
        this.out.info(`&C(255,180,220)│   &R middleware: &C1(&C4${rule.middleware.middlewareNames.join('&R, &C4')}&C1)`);
        this.out.info(`&C(255,180,220)│   &R error middleware: &C1(&C4${rule.middleware.errorMiddlewareNames.join('&R, &C4')}&C1)`);
        this.out.info('&C(255,180,220)│');
    }
    for (const rule of server.router.wsRules) {
        this.out.info(`&C(255,180,220)│  &C3ws rule: &C6${rule.urlRule}`);
        this.out.info(`&C(255,180,220)│    &R exp: &C2${rule.expression}`);
        this.out.info(`&C(255,180,220)│    &R middleware: &C1(&C4${rule.middleware.middlewareNames.join('&R, &C4')}&C1)`);
        this.out.info(`&C(255,180,220)│    &R error middleware: &C1(&C4${rule.middleware.errorMiddlewareNames.join('&R, &C4')}&C1)`);
        this.out.info('&C(255,180,220)│');
    }
    this.out.info('&C(255,180,220)╰─────────────────────────────────────────────');
}, { description: 'List all rules', usage: 'rules' });

debugUI.start();
await server.start();