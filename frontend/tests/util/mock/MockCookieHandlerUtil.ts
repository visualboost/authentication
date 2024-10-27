import {vi} from "vitest";
import {CookieHandler, IJwtContent} from "../../../src/util/CookieHandler";
import {jwtDecode} from "jwt-decode";
import {JwtContent} from "../../../src/models/auth/JwtContent";

const mockGetJwt = (jwt: string | null) => {
    //@ts-ignore
    return vi.spyOn(CookieHandler, 'getAuthToken').mockReturnValue(jwt)
};

const mockGetJwtDecoded = (jwt: string | null) => {
    if(jwt === null) {
        //@ts-ignore
        return vi.spyOn(CookieHandler, 'getAuthTokenDecoded').mockReturnValue(null)
    }else{
        const decodedJwt = jwtDecode<IJwtContent>(jwt);
        const content = new JwtContent(decodedJwt.userId, decodedJwt.role, parseInt(decodedJwt.state as string), decodedJwt.metaData.hook)
        //@ts-ignore
        return vi.spyOn(CookieHandler, 'getAuthTokenDecoded').mockReturnValue(content)
    }
};

export {
    mockGetJwt,
    mockGetJwtDecoded
}