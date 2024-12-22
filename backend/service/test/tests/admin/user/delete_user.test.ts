import request from 'supertest';
import {app} from '../../../../src/server/server.ts';
import {NextFunction, Request, Response} from "express";
import {JwtHandler} from "../../../../src/util/JwtHandler.ts";
import {createTestAdminToken} from "../../../util/JwtUtil.ts";
import {hasChangeUserRoleScope} from "../../../../src/server/middlewares/scope/hasUserScopeMiddleware.ts";

jest.mock('../../../../src/models/db/User.ts');
jest.mock('../../../../src/models/db/Settings.ts');

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

jest.mock('../../../../src/server/middlewares/hasXsrfTokenMiddleware.ts', () => ({
    hasXsrfTokenMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

jest.mock('../../../../src/server/middlewares/scope/hasUserScopeMiddleware.ts', () => ({
    hasReadMultipleUserScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
    hasWriteUserScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
    hasInviteUserScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
    hasChangeUserRoleScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    })
}));

const endpoint = '/admin/user/:userId/role';

describe(`PATCH ${endpoint}`, () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Middleware Tests', () => {

        it('should call has hasChangeUserRoleScope middleware', async () => {
            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken())
            expect(hasChangeUserRoleScope).toHaveBeenCalled();
        });

    });
});
