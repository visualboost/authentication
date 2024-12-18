import request from 'supertest';
import {Settings} from '../../../src/models/db/Settings';
import {app} from '../../../src/server/server.ts';
import {NextFunction, Request, Response} from "express";
import {JwtHandler} from "../../../src/util/JwtHandler.ts";

jest.mock('../../../src/models/db/User');
jest.mock('../../../src/models/db/Settings');
jest.mock('../../../src/util/JwtHandler.ts');

jest.mock('../../../src/server/middlewares/hasJwt.ts', () => ({
    hasJwtMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        res.locals.authToken = JwtHandler.fromRequest(req)
        next();
    }),
}));

jest.mock('../../../src/server/middlewares/isActive.ts', () => ({
    isActiveMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

jest.mock('../../../src/server/middlewares/isAdmin.ts', () => ({
    isAdminMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

jest.mock('../../../src/server/middlewares/hasXsrfTokenMiddleware.ts', () => ({
    hasXsrfTokenMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

const endpoint = '/admin/settings';

describe(`PUT ${endpoint}`, () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call update settings', async () => {
        const dummySettings = {
            tokenExpiration: {
                authenticationToken: 3600,
                refreshToken: 7200
            },
            anotherSetting: 'value'
        };

        (Settings.updateSettings as jest.Mock).mockResolvedValue(dummySettings)

        const response = await request(app)
            .put(endpoint)
            .send({settings: dummySettings})
            .expect('Content-Type', /json/)
            .expect(200);

        expect(Settings.updateSettings).toHaveBeenCalledTimes(1);
    });

    it('should update expiration time for authentication token', async () => {
        const dummySettings = {
            tokenExpiration: {
                authenticationToken: 3600,
                refreshToken: 7200
            },
            anotherSetting: 'value'
        };

        (Settings.updateSettings as jest.Mock).mockResolvedValue(dummySettings)

        const response = await request(app)
            .put(endpoint)
            .send({settings: dummySettings})
            .expect('Content-Type', /json/)
            .expect(200);

        expect(JwtHandler.updateAuthenticationTokenExpiration).toHaveBeenCalledTimes(1);
    });

    it('should update expiration time for refresh token', async () => {
        const dummySettings = {
            tokenExpiration: {
                authenticationToken: 3600,
                refreshToken: 7200
            },
            anotherSetting: 'value'
        };

        (Settings.updateSettings as jest.Mock).mockResolvedValue(dummySettings)

        const response = await request(app)
            .put(endpoint)
            .send({settings: dummySettings})
            .expect('Content-Type', /json/)
            .expect(200);

        expect(JwtHandler.updateRefreshTokenExpiration).toHaveBeenCalledTimes(1);
    });

});
