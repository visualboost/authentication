import {UserState} from "../../src/models/auth/UserState";
//@ts-ignore
import jwt from "jsonwebtoken";

const createToken = (_id: string, role: string, userstate: UserState): string => {
    return jwt.sign({
        userId: _id, role: role, state: userstate
    }, "A_SUPER_SECRET_JWT_KEY");
}

export {
    createToken
}