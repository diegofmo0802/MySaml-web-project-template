import { Logger } from "saml.servercore";

export const debug = new Logger({
    prefix: 'API', debug: 'api'
});

export default debug;