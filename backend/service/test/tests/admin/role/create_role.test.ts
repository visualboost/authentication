import request from 'supertest';
import {User} from '../../../../src/models/db/User.ts';
import {Settings} from '../../../../src/models/db/Settings.ts';
import {app} from '../../../../src/server/server.ts';
import {NextFunction, Request, Response} from "express";
import {UserState} from "../../../../src/constants/UserState.ts";
import {IEmailCredentials} from "../../../../src/models/db/credentials/EMailCredentials.ts";
import {UserSearchCriterias} from "../../../../src/constants/UserSearchCriterias.ts";
import {hasJwtMiddleware} from "../../../../src/server/middlewares/hasJwt.ts";
import {JwtHandler} from "../../../../src/util/JwtHandler.ts";
import {hasXsrfTokenMiddleware} from "../../../../src/server/middlewares/hasXsrfTokenMiddleware.ts";
import {isActiveMiddleware} from "../../../../src/server/middlewares/isActive.ts";
import {isAdminMiddleware} from "../../../../src/server/middlewares/isAdmin.ts";
import {createTestAdminToken} from "../../../util/JwtUtil.ts";
import {
    hasReadMultipleUserScope,
    hasWriteUserScope
} from "../../../../src/server/middlewares/scope/hasUserScopeMiddleware.ts";
import {hasReadRoleScope, hasWriteRoleScope} from "../../../../src/server/middlewares/scope/hasRoleScopesMiddleware.ts";

jest.mock('../../../../src/models/db/Roles.ts');

jest.mock('../../../../src/server/middlewares/hasJwt.ts', () => ({
    hasJwtMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        res.locals.authToken = JwtHandler.fromRequest(req)
        next();
    }),
}));

jest.mock('../../../../src/server/middlewares/isActive.ts', () => ({
    isActiveMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

jest.mock('../../../../src/server/middlewares/isAdmin.ts', () => ({
    isAdminMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

jest.mock('../../../../src/server/middlewares/hasXsrfTokenMiddleware.ts', () => ({
    hasXsrfTokenMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

jest.mock('../../../../src/server/middlewares/scope/hasRoleScopesMiddleware.ts', () => ({
    hasReadRoleScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
    hasWriteRoleScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    })
}));

const endpoint = '/admin/role';

describe(`POST ${endpoint}`, () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Middleware Tests', () => {

        it('should call has hasWriteRoleScope middleware', async () => {
            const res = await request(app)
                .post(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken())
            expect(hasWriteRoleScope).toHaveBeenCalled();
        });


    });
});
