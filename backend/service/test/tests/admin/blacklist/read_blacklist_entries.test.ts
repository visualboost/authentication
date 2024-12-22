import request from 'supertest';
import {app} from '../../../../src/server/server.ts';
import {NextFunction, Request, Response} from "express";
import {JwtHandler} from "../../../../src/util/JwtHandler.ts";
import {createTestAdminToken} from "../../../util/JwtUtil.ts";
import {hasBlackListReadScope} from "../../../../src/server/middlewares/scope/hasBlacklistScopesMiddleware.ts";

jest.mock('../../../../src/models/db/Blacklist.ts');
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

jest.mock('../../../../src/server/middlewares/scope/hasBlacklistScopesMiddleware.ts', () => ({
    hasBlackListReadScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
    hasBlackListWriteScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    })

}));

const endpoint = '/admin/blacklist';

describe(`GET ${endpoint}`, () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Middleware Tests', () => {

        it('should call has hasBlackListReadScope middleware', async () => {
            const res = await request(app)
                .get(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken())
            expect(hasBlackListReadScope).toHaveBeenCalled();
        });


    });
});