import Container from './components/Container.js';

import Hello from './pages/Hello.page.js';

export function HelloPage(this: Container) {
    const page = new Hello
    this.append(page)
}