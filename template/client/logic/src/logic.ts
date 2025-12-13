import app, { schema, content } from './app.js';
import * as actions from './actions.js';
import Api from './api/api.js';

declare global {
    interface Window {
        app: typeof app;
        api: typeof Api;
        content: typeof content
    }
}

window.app = app;
window.api = Api;
window.content = content;

/* Initializing App */

app.renderRoot(...schema);

app.router.addRule('/', actions.HelloPage.bind(content));
app.router.addRule('/app', actions.HelloPage.bind(content));

app.init();