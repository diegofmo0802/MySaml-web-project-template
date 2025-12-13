import { Component, Element } from '../WebApp/WebApp.js';

export class Container extends Component<'div'> {
    protected root: Element<'div'>;
    public constructor(options: Container.options = {}) { super();
        this.root = Element.new('div', null, { class: 'Container' });
        if (options.class) this.root.setAttribute('class', options.class);
        if (options.id) this.root.setAttribute('id', options.id);
    }
    /**
     * Shows elements in the container.
     * @param elements The elements to show in the container.
     */
    public show(...elements: Element.ChildType[]): void {
        this.root.clean();
        this.root.append(...elements);
    }
    /**
     * Appends elements to the container.
     * @param elements The elements to append to the container.
     */
    public append(...elements: Element.ChildType[]): void { this.root.append(...elements); }
    /**
     * Removes all elements from the container.
     */
    public clean(): void { this.root.clean(); }
}
export namespace Container {
    export interface options {
        class?: string;
        id?: string;
    }
}
export default Container;