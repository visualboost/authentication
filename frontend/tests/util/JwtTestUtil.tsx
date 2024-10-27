import {UserState} from "../../src/models/auth/UserState";
//@ts-ignore
import jwt from "jsonwebtoken";

const createToken = (_id: string, role: string, userstate: UserState, hook: string | null): string => {
    return jwt.sign({
        userId: _id, role: role, state: userstate, metaData: {hook: hook}
    }, "A_SUPER_SECRET_JWT_KEY");
}

export {
    createToken
}