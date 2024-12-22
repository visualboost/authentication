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
import {hasStatisticsReadRoleScope} from "../../../../src/server/middlewares/scope/hasStatisticScopeMiddleware.ts";

jest.mock('../../../../src/models/db/User.ts');
jest.mock('../../../../src/models/db/Blacklist.ts');
jest.mock('../../../../src/models/db/Roles.ts');
jest.mock('../../../../src/models/db/settings/LoginStatistic.ts');
jest.mock('../../../../src/models/db/settings/DeletedUserStatistic.ts');

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

jest.mock('../../../../src/server/middlewares/scope/hasStatisticScopeMiddleware.ts', () => ({
    hasStatisticsReadRoleScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    })
}));

const endpoint = '/admin/statistics';

describe(`GET ${endpoint}`, () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Middleware Tests', () => {

        it('should call has hasStatisticsReadRoleScope middleware', async () => {
            const res = await request(app)
                .get(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken())
            expect(hasStatisticsReadRoleScope).toHaveBeenCalled();
        });

    });

});
