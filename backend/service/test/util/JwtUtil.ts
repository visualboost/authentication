import {JwtHandler} from "../../src/util/JwtHandler.ts";
import {SystemRoles} from "../../src/constants/role/SystemRoles.ts";
import {UserState} from "../../src/constants/UserState.ts";
import {Admin} from "../../src/constants/role/Admin.ts";
import {User} from "../../src/models/db/User.ts";
import {DefaultUser} from "../../src/constants/role/DefaultUser.ts";

const createTestAdminToken = (userId = "userId1234", state: UserState = UserState.ACTIVE): string => {
    const adminRole = new Admin();
    return JwtHandler.createAuthToken(userId, adminRole.name, adminRole.scopes, UserState.ACTIVE)
}

const createDefaultRoleToken = (userId = "userId1234", state: UserState = UserState.ACTIVE): string => {
    const defaultRole = new DefaultUser();
    return JwtHandler.createAuthToken(userId, defaultRole.name, defaultRole.scopes, UserState.ACTIVE)
}

export {
    createDefaultRoleToken,
    createTestAdminToken
}