import App, { Element } from './WebApp/WebApp.js';
import Container from './components/Container.js';

export const app = App.getInstance('#app');
export const content = new Container({ id: 'content' });

export const schema: Element.ChildType[] = [ content ];
export const components = { content }

export default app;