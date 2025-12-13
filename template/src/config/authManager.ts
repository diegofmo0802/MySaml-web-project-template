import { Beta } from 'saml.servercore';
import { jwt as jwtEnv } from './env.js';
import AuthManager from '../managers/AuthManager.js';

export const jwt = new Beta.JwtManager('HS512', jwtEnv.secret);
export const authManager = new AuthManager(jwt);

export default authManager;