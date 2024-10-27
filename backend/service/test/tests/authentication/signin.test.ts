import request from 'supertest';
import { User } from '../../../src/models/db/User.ts';
import { Settings } from '../../../src/models/db/Settings.ts';
import { FailedLoginAttemptsModel } from "../../../src/models/db/settings/LoginStatistic.ts";
import { TwoFactorAuthCodeModel } from "../../../src/models/db/FactorAuthCode.ts";
import { MailHandler } from "../../../src/util/MailHandler.ts";
import { app } from "../../../src/server/server.ts";
import { JwtHandler } from "../../../src/util/JwtHandler.ts";
import { NextFunction, Request, Response } from "express";
import {isBlacklistedMiddleware} from "../../../src/server/middlewares/isBlacklisted.ts";

jest.mock('../../../src/models/db/User.ts');
jest.mock('../../../src/models/db/Settings.ts');
jest.mock('../../../src/models/db/FactorAuthCode.ts');
jest.mock('../../../src/models/db/settings/LoginStatistic.ts');
jest.mock('../../../src/util/MailHandler.ts');
jest.mock('../../../src/util/JwtHandler.ts');

jest.mock('../../../src/server/middlewares/isBlacklisted.ts', () => ({
    isBlacklistedMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

jest.mock('../../../src/server/middlewares/hasXsrfTokenMiddleware.ts', () => ({
    hasXsrfTokenMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

describe('POST /authentication/signin', () => {
    const endpoint = '/authentication/signin';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {

        it('should return 200 and two-factor auth ID if two-factor is enabled for admin', async () => {
            const mockUser = {
                _id: '123',
                isAdmin: () => true,
                getAuthToken: jest.fn(),
                updateLastLogin: jest.fn(),
                getRefreshToken: jest.fn()
            };
            const mockSettings = { twoFactorAuthorization: { admin: true, clients: false } };
            const mockTwoFactorAuthDoc = { _id: '456', code: '123456' };

            (User.getByCredentials as jest.Mock).mockResolvedValueOnce(mockUser);
            (Settings.load as jest.Mock).mockResolvedValueOnce(mockSettings);
            (TwoFactorAuthCodeModel.createNewAuthCode as jest.Mock).mockResolvedValueOnce(mockTwoFactorAuthDoc);

            const res = await request(app).post(endpoint).send({ email: 'admin@example.com', password: 'password' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ token: null, hook: null, twoFactorAuthId: '456' });
            expect(TwoFactorAuthCodeModel.createNewAuthCode).toHaveBeenCalledWith('123');
            expect(MailHandler.send2FactorAuthMail).toHaveBeenCalledWith('admin@example.com', undefined, '123456');
        });

        it('should return 200 and two-factor auth ID if two-factor is enabled for client', async () => {
            const mockUser = {
                _id: '123',
                isAdmin: () => false,
                getAuthToken: jest.fn(),
                updateLastLogin: jest.fn(),
                getRefreshToken: jest.fn()
            };
            const mockSettings = { twoFactorAuthorization: { admin: false, clients: true } };
            const mockTwoFactorAuthDoc = { _id: '456', code: '123456' };

            (User.getByCredentials as jest.Mock).mockResolvedValueOnce(mockUser);
            (Settings.load as jest.Mock).mockResolvedValueOnce(mockSettings);
            (TwoFactorAuthCodeModel.createNewAuthCode as jest.Mock).mockResolvedValueOnce(mockTwoFactorAuthDoc);

            const res = await request(app).post(endpoint).send({ email: 'client@example.com', password: 'password' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ token: null, hook: null, twoFactorAuthId: '456' });
            expect(TwoFactorAuthCodeModel.createNewAuthCode).toHaveBeenCalledWith('123');
            expect(MailHandler.send2FactorAuthMail).toHaveBeenCalledWith('client@example.com', undefined, '123456');
        });

        it('should return 200 and auth token if two-factor is disabled', async () => {
            const mockUser = {
                _id: '123',
                isAdmin: () => false,
                getAuthToken: jest.fn().mockResolvedValueOnce({ token: 'auth-token' }),
                getRefreshToken: jest.fn().mockReturnValueOnce('refresh-token'),
                updateLastLogin: jest.fn()
            };
            const mockSettings = { twoFactorAuthorization: { admin: false, clients: false } };

            (User.getByCredentials as jest.Mock).mockResolvedValueOnce(mockUser);
            (Settings.load as jest.Mock).mockResolvedValueOnce(mockSettings);
            (Settings.getAuthenticationHook as jest.Mock).mockResolvedValueOnce(null);

            const res = await request(app).post(endpoint).send({ email: 'user@example.com', password: 'password' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ token: 'auth-token', hook: null, twoFactorAuthId: null });
        });

        it('Sets the refresh token as httponly cookie if two-factor is disabled', async () => {
            const mockUser = {
                _id: '123',
                isAdmin: () => false,
                getAuthToken: jest.fn().mockResolvedValueOnce({ token: 'auth-token' }),
                getRefreshToken: jest.fn().mockReturnValueOnce('refresh-token'),
                updateLastLogin: jest.fn()
            };
            const mockSettings = { twoFactorAuthorization: { admin: false, clients: false } };

            (User.getByCredentials as jest.Mock).mockResolvedValueOnce(mockUser);
            (Settings.load as jest.Mock).mockResolvedValueOnce(mockSettings);
            (Settings.getAuthenticationHook as jest.Mock).mockResolvedValueOnce(null);

            const res = await request(app).post(endpoint).send({ email: 'user@example.com', password: 'password' });

            expect(res.status).toBe(200);
            expect(JwtHandler.setRefreshTokenCookie).toHaveBeenCalledWith('refresh-token', expect.anything());
        });

    });

    describe('Error', () => {

        it('should return 400 if email is missing', async () => {
            const res = await request(app).post(endpoint).send({ password: 'TestXXX1234!' });
            expect(res.status).toBe(400);
        });

        it('should return 400 if password is missing', async () => {
            const res = await request(app).post(endpoint).send({ email: 'test@test@gmail.com' });
            expect(res.status).toBe(400);
        });

        it('should return 404 if user is not found', async () => {
            (User.getByCredentials as jest.Mock).mockResolvedValueOnce(null);

            const res = await request(app).post(endpoint).send({ email: 'test@example.com', password: 'wrongpassword' });
            expect(res.status).toBe(404);
            expect(FailedLoginAttemptsModel.logFailedLoginAttempt).toHaveBeenCalledWith(expect.any(String), 'test@example.com');
        });

        it('should handle errors and return 500 status', async () => {
            (User.getByCredentials as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            const res = await request(app).post(endpoint).send({ email: 'user@example.com', password: 'password' });
            expect(res.status).toBe(500);
        });

    });

    describe('Middleware Tests', () => {

        it('should call isBlacklistedMiddleware', async () => {
            const res = await request(app).post(endpoint).send({ email: 'user@example.com', password: 'password' });
            expect(isBlacklistedMiddleware).toHaveBeenCalled();
        });

    });

});
