import request from 'supertest';
import {UserModification} from '../../../src/models/db/UserModification';
import {User} from '../../../src/models/db/User';
import {MailHandler} from '../../../src/util/MailHandler';
import {app} from '../../../src/server/server';
import {Success} from '../../../src/models/api/Success';
import BadRequestError from '../../../src/errors/BadRequestError';
import ForbiddenError from '../../../src/errors/ForbiddenError';
import NotFoundError from '../../../src/errors/NotFoundError';
import {JwtHandler} from '../../../src/util/JwtHandler';
import {SystemRoles} from '../../../src/constants/role/SystemRoles.ts';
import {UserState} from '../../../src/constants/UserState';
import {validatePassword} from "../../../src/util/PasswordUtil.ts";
import {NextFunction, Request, Response} from "express";
import {hasXsrfTokenMiddleware} from "../../../src/server/middlewares/hasXsrfTokenMiddleware.ts";
import {hasJwtMiddleware} from "../../../src/server/middlewares/hasJwt.ts";
import * as EncryptionUtil from "../../../src/util/EncryptionUtil.ts"
import {createDefaultRoleToken} from "../../util/JwtUtil.ts";

jest.mock('../../../src/models/db/User');
jest.mock('../../../src/models/db/UserModification');
jest.mock('../../../src/util/MailHandler');
jest.mock('../../../src/util/PasswordUtil');

jest.mock('../../../src/server/middlewares/hasJwt.ts', () => ({
    hasJwtMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        res.locals.authToken = JwtHandler.fromRequest(req)
        next();
    }),
}));

jest.mock('../../../src/server/middlewares/hasXsrfTokenMiddleware.ts', () => ({
    hasXsrfTokenMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

describe('PATCH /user/modify/password', () => {
    const endpoint = '/user/modify/password';
    const mockJwt = {getUserId: jest.fn()};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {

        it('should return 200 and success response when password modification object is successfully created and confirmation email is sent', async () => {
            const userId = '123';
            const newPassword = 'NewPassword123!';
            const currentPassword = 'OldPassword123!';
            const userName = 'testUser';
            const currentUserMail = 'user@example.com';

            mockJwt.getUserId.mockReturnValue(userId);
            (User.findById as jest.Mock).mockResolvedValueOnce({
                getCredentials: jest.fn().mockResolvedValueOnce({
                    email: currentUserMail,
                    validatePassword: jest.fn().mockResolvedValue(true),
                }),
                userName,
            });
            (UserModification.createPasswordModification as jest.Mock).mockResolvedValueOnce({
                createToken: jest.fn().mockResolvedValue('token'),
            });
            (MailHandler.sendPasswordModificationMail as jest.Mock).mockResolvedValueOnce(true);
            (validatePassword as jest.Mock).mockReturnValueOnce([]);
            jest.spyOn(EncryptionUtil, "decryptEmailIfAllowedBySystem").mockResolvedValue(currentUserMail)

            // Perform request
            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken(userId))
                .send({currentPassword, newPassword});

            // Assertions
            expect(res.status).toBe(200);
            expect(res.body).toEqual(new Success());
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(MailHandler.sendPasswordModificationMail).toHaveBeenCalledWith(currentUserMail, 'token', userName);
        });
    });

    describe('Error', () => {

        it('should return 400 if userId is missing', async () => {
            mockJwt.getUserId.mockReturnValue(null);

            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken(""))
                .send({currentPassword: 'password123', newPassword: 'Test12345'});

            expect(res.status).toBe(new BadRequestError().status);
            expect(res.body).toEqual({message: new BadRequestError().message});
        });

        it('should return 400 if current password is missing', async () => {
            mockJwt.getUserId.mockReturnValue(null);

            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken())
                .send({currentPassword: '', newPassword: 'Test12345'});

            expect(res.status).toBe(new BadRequestError().status);
            expect(res.body).toEqual({message: new BadRequestError().message});
        });

        it('should return 400 if new password is missing', async () => {
            mockJwt.getUserId.mockReturnValue(null);

            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken())
                .send({currentPassword: 'Test12345', newPassword: ''});

            expect(res.status).toBe(new BadRequestError().status);
            expect(res.body).toEqual({message: new BadRequestError().message});
        });

        it('should return 400 if the new password is invalid', async () => {
            const userId = '123';
            const newPassword = 'invalid';
            const currentPassword = 'OldPassword123!';

            mockJwt.getUserId.mockReturnValue(userId);
            (validatePassword as jest.Mock).mockReturnValueOnce(['Password too weak']);

            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken())
                .send({currentPassword, newPassword});

            expect(res.status).toBe(new BadRequestError().status);
            expect(res.body).toEqual({message: new BadRequestError().message});
        });

        it('should return 403 if the current password is incorrect', async () => {
            const userId = '123';
            const currentPassword = 'WrongPassword!';
            const newPassword = 'NewPassword123!';

            mockJwt.getUserId.mockReturnValue(userId);
            (validatePassword as jest.Mock).mockReturnValueOnce([]);

            (User.findById as jest.Mock).mockResolvedValueOnce({
                getCredentials: jest.fn().mockResolvedValueOnce({
                    validatePassword: jest.fn().mockResolvedValue(false), // Incorrect password
                }),
            });

            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken())
                .send({currentPassword, newPassword});

            expect(res.status).toBe(new ForbiddenError().status);
            expect(res.body).toEqual({message: new ForbiddenError().message});
        });

        it('should return 404 if the user is not found', async () => {
            const userId = '123';
            const currentPassword = 'OldPassword123!';
            const newPassword = 'NewPassword123!';

            mockJwt.getUserId.mockReturnValue(userId);
            (validatePassword as jest.Mock).mockReturnValueOnce([]);
            (User.findById as jest.Mock).mockResolvedValueOnce(null);

            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken())
                .send({currentPassword, newPassword});

            expect(res.status).toBe(new NotFoundError().status);
            expect(res.body).toEqual({message: new NotFoundError().message});
        });

        it('should handle errors and return 500 status', async () => {
            const userId = '123';
            const currentPassword = 'OldPassword123!';
            const newPassword = 'NewPassword123!';

            mockJwt.getUserId.mockReturnValue(userId);
            (User.findById as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken())
                .send({currentPassword, newPassword});

            expect(res.status).toBe(500);
        });
    });

    describe('Middleware Tests', () => {

        it('should call hasJwtMiddleware', async () => {
            await request(app).patch(endpoint);
            expect(hasJwtMiddleware).toHaveBeenCalled();
        });

        it('should call hasXsrfTokenMiddleware', async () => {
            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken())
            expect(hasXsrfTokenMiddleware).toHaveBeenCalled();
        });

    });
});
