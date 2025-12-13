import { Component, Element } from '../WebApp/WebApp.js';

import Button from '../components.basic/Button.js';

export class Hello extends Component<'div'> {
    protected root: Element<'div'>;
    public constructor() { super();
        this.root = Element.new('div', null, { id: 'HelloPage' });
        const eH1 = Element.new('h1', 'Hello World!');
        const cButton = new Button('Click me!'/*, { image: '/favicon.ico' }*/);

        let count = 0;
        cButton.on('click', () => eH1.text = `Hello World! count: ${count++}`);

        this.root.append(eH1, cButton);
    }
}
export namespace Hello {}

export default Hello;