import request from 'supertest';
import {Settings} from '../../../../src/models/db/Settings.ts';
import {app} from '../../../../src/server/server.ts';
import {NextFunction, Request, Response} from "express";
import {JwtHandler} from "../../../../src/util/JwtHandler.ts";
import {createTestAdminToken} from "../../../util/JwtUtil.ts";
import {
    hasSettingsReadRoleScope,
    hasSettingsWriteRoleScope
} from "../../../../src/server/middlewares/scope/hasSettingsScopesMiddleware.ts";

jest.mock('../../../../src/models/db/User.ts');
jest.mock('../../../../src/models/db/Settings.ts');
jest.mock('../../../../src/util/JwtHandler.ts');

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

jest.mock('../../../../src/server/middlewares/scope/hasSettingsScopesMiddleware.ts', () => ({
    hasSettingsReadRoleScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
    hasSettingsWriteRoleScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

jest.mock('../../../../src/server/middlewares/hasXsrfTokenMiddleware.ts', () => ({
    hasXsrfTokenMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

const endpoint = '/admin/settings/encrypt/emails';

describe(`POST ${endpoint}`, () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Middleware Tests', () => {

        it('should call has hasSettingsWriteRoleScope middleware', async () => {
            const res = await request(app)
                .post(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken())
            expect(hasSettingsWriteRoleScope).toHaveBeenCalled();
        });

    });

});
