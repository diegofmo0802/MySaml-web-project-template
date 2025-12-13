import UserManager from "../managers/UserManager/UserManager.js";
import db from "./dbManager.js";

export const userCollection = db.collection('user');

export const userManager = new UserManager(userCollection);
export default userManager;