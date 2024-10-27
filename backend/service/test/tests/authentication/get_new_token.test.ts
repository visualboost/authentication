import request from 'supertest';
import { User } from '../../../src/models/db/User.ts';
import { app } from '../../../src/server/server.ts';
import { JwtHandler } from '../../../src/util/JwtHandler.ts';
import ForbiddenError from "../../../src/errors/ForbiddenError.ts";
import {CookieNames} from "../../../src/constants/CookieNames.ts";
import {NextFunction, Request, Response} from "express";
import {isBlacklistedMiddleware} from "../../../src/server/middlewares/isBlacklisted.ts";
import {SystemRoles} from "../../../src/constants/SystemRoles.ts";
import {UserState} from "../../../src/constants/UserState.ts";
import {hasXsrfTokenMiddleware} from "../../../src/server/middlewares/hasXsrfTokenMiddleware.ts";

jest.mock('../../../src/models/db/User.ts');
jest.mock('../../../src/util/JwtHandler.ts');

jest.mock('../../../src/server/middlewares/hasXsrfTokenMiddleware.ts', () => ({
    hasXsrfTokenMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

describe('PUT /authentication/token', () => {
    const endpoint = '/authentication/token';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {
        it('should return a new auth token and set refresh token in the http only cookie if request is valid', async () => {
            const mockUser = {
                _id: 'user123',
                getAuthToken: jest.fn().mockResolvedValue({ token: 'new-auth-token' }),
                getRefreshToken: jest.fn().mockReturnValue('new-refresh-token'),
            };

            (JwtHandler.decodeRefreshToken as jest.Mock).mockReturnValue('user123');
            (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);

            const res = await request(app)
                .put(endpoint)
                .set('Cookie', `${CookieNames.REFRESH_TOKEN}=valid-refresh-token`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ token: 'new-auth-token' });
            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(JwtHandler.setRefreshTokenCookie).toHaveBeenCalledWith('new-refresh-token', expect.anything());
        });
    });

    describe('Error', () => {
        it('should return 403 if refresh token is missing in the request', async () => {
            const res = await request(app).put(endpoint);

            expect(res.status).toBe(403);
            expect(User.findById).not.toHaveBeenCalled();
            expect(JwtHandler.decodeRefreshToken).not.toHaveBeenCalled();
        });

        it('should return 403 if the refresh token is invalid', async () => {
            (JwtHandler.decodeRefreshToken as jest.Mock).mockImplementation(() => {
                throw new ForbiddenError();
            });

            const res = await request(app)
                .put(endpoint)
                .set('Cookie', `${CookieNames.REFRESH_TOKEN}=invalid-refresh-token`);

            expect(res.status).toBe(403);
            expect(User.findById).not.toHaveBeenCalled();
        });

        it('should return 404 if the user is not found', async () => {
            (JwtHandler.decodeRefreshToken as jest.Mock).mockReturnValue('user123');
            (User.findById as jest.Mock).mockResolvedValueOnce(null);

            const res = await request(app)
                .put(endpoint)
                .set('Cookie', `${CookieNames.REFRESH_TOKEN}=valid-refresh-token`);

            expect(res.status).toBe(404);
        });

        it('should return 500 if an unexpected error occurs', async () => {
            (JwtHandler.decodeRefreshToken as jest.Mock).mockReturnValue('user123');
            (User.findById as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            const res = await request(app)
                .put(endpoint)
                .set('Cookie', `${CookieNames.REFRESH_TOKEN}=valid-refresh-token`);

            expect(res.status).toBe(500);
        });
    });

    describe('Middleware Tests', () => {

        it('should call hasXsrfTokenMiddleware', async () => {
            const res = await request(app)
                .put(endpoint)
                .set('Authorization', 'Bearer ' + JwtHandler.createAuthToken("userId123", SystemRoles.USER, UserState.ACTIVE))
            expect(hasXsrfTokenMiddleware).toHaveBeenCalled();
        });

    });
});
