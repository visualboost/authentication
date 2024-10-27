import request from 'supertest';
import {User} from '../../../src/models/db/User.ts';
import {MailHandler} from '../../../src/util/MailHandler.ts';
import {app} from '../../../src/server/server.ts';
import {NextFunction, Request, Response} from "express";
import {decryptEmailIfAllowedBySystem} from "../../../src/util/EncryptionUtil.ts";
import {JwtHandler} from "../../../src/util/JwtHandler.ts";
import {SystemRoles} from "../../../src/constants/SystemRoles.ts";
import {UserState} from "../../../src/constants/UserState.ts";
import {hasXsrfTokenMiddleware} from "../../../src/server/middlewares/hasXsrfTokenMiddleware.ts";
import {hasJwtMiddleware} from "../../../src/server/middlewares/hasJwt.ts";

jest.mock('../../../src/models/db/User.ts');
jest.mock('../../../src/util/MailHandler.ts');
jest.mock('../../../src/util/JwtHandler.ts');
jest.mock('../../../src/util/EncryptionUtil.ts');

jest.mock('../../../src/server/middlewares/hasXsrfTokenMiddleware.ts', () => ({
    hasXsrfTokenMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

jest.mock('../../../src/server/middlewares/hasJwt.ts', () => ({
    hasJwtMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        res.locals.authToken = {
            getUserId: jest.fn().mockReturnValue('123'),
        };
        next();
    }),
}));

describe('POST /registration/resend', () => {
    const endpoint = '/authentication/registration/resend';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {
        it('should return 200 and send registration email if user is found', async () => {
            const mockUser = {
                _id: '123',
                userName: 'testUser',
                getCredentials: jest.fn().mockResolvedValueOnce({
                    email: 'encryptedEmail',
                }),
            };
            const mockDecryptedEmail = 'test@example.com';

            (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);
            (MailHandler.sendRegistrationMail as jest.Mock).mockResolvedValueOnce(true);
            (decryptEmailIfAllowedBySystem as jest.Mock).mockResolvedValueOnce(mockDecryptedEmail);

            const res = await request(app).post(endpoint);

            expect(res.status).toBe(200);
            expect(MailHandler.sendRegistrationMail).toHaveBeenCalledWith(
                mockDecryptedEmail,
                mockUser._id.toString(),
                mockUser.userName
            );
        });

        it('should call decryptEmailIfAllowedBySystem with the correct email', async () => {
            const mockUser = {
                _id: '123',
                userName: 'testUser',
                getCredentials: jest.fn().mockResolvedValueOnce({
                    email: 'encryptedEmail',
                }),
            };

            (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);
            const mockDecryptedEmail = 'test@example.com';
            (decryptEmailIfAllowedBySystem as jest.Mock).mockResolvedValueOnce(mockDecryptedEmail);

            const res = await request(app).post(endpoint);

            expect(res.status).toBe(200);
            expect(decryptEmailIfAllowedBySystem).toHaveBeenCalledWith('encryptedEmail');
        });
    });

    describe('Error', () => {
        it('should return 404 if user is not found', async () => {
            (User.findById as jest.Mock).mockResolvedValueOnce(null);

            const res = await request(app).post(endpoint);

            expect(res.status).toBe(404);
        });

        it('should return 500 if MailHandler throws an error', async () => {
            const mockUser = {
                _id: '123',
                userName: 'testUser',
                getCredentials: jest.fn().mockResolvedValueOnce({
                    email: 'encryptedEmail',
                }),
            };
            const mockDecryptedEmail = 'test@example.com';

            (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);
            (decryptEmailIfAllowedBySystem as jest.Mock).mockResolvedValueOnce(mockDecryptedEmail);
            (MailHandler.sendRegistrationMail as jest.Mock).mockRejectedValueOnce(new Error('Mail Error'));

            const res = await request(app).post(endpoint);

            expect(res.status).toBe(500);
        });
    });

    describe('Middleware Tests', () => {
        it('should call hasJwtMiddleware', async () => {
            const res = await request(app).post(endpoint)
                .set('Authorization', 'Bearer ' + JwtHandler.createAuthToken("userId123", SystemRoles.USER, UserState.ACTIVE))

            expect(hasJwtMiddleware).toHaveBeenCalled();
        });

        it('should call hasXsrfTokenMiddleware', async () => {
            const res = await request(app)
                .post(endpoint)
                .set('Authorization', 'Bearer ' + JwtHandler.createAuthToken("userId123", SystemRoles.USER, UserState.ACTIVE))
            expect(hasXsrfTokenMiddleware).toHaveBeenCalled();
        });
    });


});
