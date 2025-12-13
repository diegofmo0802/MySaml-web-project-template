export { Utilities } from './helpers/Utilities.js';

import _Auth from './Auth.js';
import _User from './User.js';

export namespace Api {
    export import auth = _Auth;
    export import user = _User;
}
export default Api;