import UserManager from "managers/UserManager/UserManager.js";
import db from "./dbManager.js";

export const userManager = new UserManager(db);
export default userManager;
export { UserManager };