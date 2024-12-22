import request from 'supertest';
import {UserModification} from '../../../src/models/db/UserModification';
import {User} from '../../../src/models/db/User';
import {MailHandler} from '../../../src/util/MailHandler';
import {app} from '../../../src/server/server';
import {EmailCredentialsModel} from "../../../src/models/db/credentials/EMailCredentials.ts";
import BadRequestError from "../../../src/errors/BadRequestError.ts";
import ConflictError from "../../../src/errors/ConflictError.ts";
import NotFoundError from "../../../src/errors/NotFoundError.ts";
import {Success} from "../../../src/models/api/Success.ts";
import {NextFunction, Request, Response} from "express";
import {decryptEmailIfAllowedBySystem, getAuthenticationTokenSecret} from '../../../src/util/EncryptionUtil.ts';
import {createDefaultRoleToken} from "../../util/JwtUtil.ts";

jest.mock('../../../src/models/db/credentials/EMailCredentials');
jest.mock('../../../src/models/db/UserModification');
jest.mock('../../../src/models/db/User');
jest.mock('../../../src/util/MailHandler');
jest.mock('../../../src/util/EncryptionUtil.ts');

jest.mock('../../../src/server/middlewares/hasXsrfTokenMiddleware', () => ({
    hasXsrfTokenMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

describe('PATCH /user/modify/email', () => {
    const endpoint = '/user/modify/email';
    const mockJwt = {getUserId: jest.fn()};

    beforeEach(() => {
        jest.clearAllMocks();
        (getAuthenticationTokenSecret as jest.Mock).mockReturnValue("some_super_secret_key")
    });

    describe('Success', () => {

        it('should return 200 and success response when email modification object is successfully created and confirmation email is sent', async () => {
            const userId = '123';
            const newEmail = 'new@example.com';
            const originEmail = 'current@example.com';
            const userName = 'testUser';

            mockJwt.getUserId.mockReturnValue(userId);
            (decryptEmailIfAllowedBySystem as jest.Mock).mockReturnValue(originEmail);
            (EmailCredentialsModel.emailExists as jest.Mock).mockResolvedValueOnce(false);
            (UserModification.createEMailModification as jest.Mock).mockResolvedValueOnce({
                metadata: {originMail: originEmail},
                createToken: jest.fn().mockResolvedValue('token'),
            });
            (User.findById as jest.Mock).mockResolvedValueOnce({userName});
            (MailHandler.sendEmailModificationMail as jest.Mock).mockResolvedValueOnce(true);

            // Perform request
            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken(userId))
                .send({email: newEmail});

            // Assertions
            expect(res.status).toBe(200);
            expect(res.body).toEqual(new Success());
            expect(EmailCredentialsModel.emailExists).toHaveBeenCalledWith(newEmail);
            expect(UserModification.createEMailModification).toHaveBeenCalledWith(userId, newEmail);
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(MailHandler.sendEmailModificationMail).toHaveBeenCalledWith(originEmail, 'token', userName);
        });

        it('should call `decryptEmailIfAllowedBySystem(originEmail)` to decrypt the email address before confirmation email will be sent. Email will be only decrypted if its defined in the settings.', async () => {
            const userId = '123';
            const newEmail = 'new@example.com';
            const originEmail = 'current@example.com';
            const userName = 'testUser';

            // Mock JWT and database models
            mockJwt.getUserId.mockReturnValue(userId);
            (EmailCredentialsModel.emailExists as jest.Mock).mockResolvedValueOnce(false);
            (UserModification.createEMailModification as jest.Mock).mockResolvedValueOnce({
                metadata: {originMail: originEmail},
                createToken: jest.fn().mockResolvedValue('token'),
            });
            (User.findById as jest.Mock).mockResolvedValueOnce({userName});
            (MailHandler.sendEmailModificationMail as jest.Mock).mockResolvedValueOnce(true);

            // Perform request
            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken())  // Add headers if needed
                .send({email: newEmail});

            expect(decryptEmailIfAllowedBySystem).toHaveBeenCalledWith(originEmail);
        });

    });

    describe('Error', () => {

        it('should return 400 if userId is missing', async () => {
            // Mock missing user ID in JWT
            mockJwt.getUserId.mockReturnValue(null);

            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken(""))
                .send({email: 'new@example.com'});

            expect(res.status).toBe(new BadRequestError().status);
            expect(res.body).toEqual({message: new BadRequestError().message});
        });

        it('should return 400 if email is missing', async () => {
            // Mock missing user ID in JWT
            mockJwt.getUserId.mockReturnValue(null);

            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken())
                .send({email: ''});

            expect(res.status).toBe(new BadRequestError().status);
            expect(res.body).toEqual({message: new BadRequestError().message});
        });

        it('should return 409 if email already exists', async () => {
            const userId = '123';
            const newEmail = 'existing@example.com';

            mockJwt.getUserId.mockReturnValue(userId);
            (EmailCredentialsModel.emailExists as jest.Mock).mockResolvedValueOnce(true);

            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken())  // Add headers if needed
                .send({email: newEmail});

            expect(res.status).toBe(new ConflictError().status);
            expect(res.body).toEqual({message: new ConflictError().message});
        });

        it('should return 404 if user is not found', async () => {
            const userId = '123';
            const newEmail = 'new@example.com';

            mockJwt.getUserId.mockReturnValue(userId);
            (EmailCredentialsModel.emailExists as jest.Mock).mockResolvedValueOnce(false);
            (UserModification.createEMailModification as jest.Mock).mockResolvedValueOnce({
                metadata: {originMail: 'origin@example.com'},
                createToken: jest.fn().mockResolvedValue('token'),
            });
            (User.findById as jest.Mock).mockResolvedValueOnce(null);

            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken())  // Add headers if needed
                .send({email: newEmail});

            expect(res.status).toBe(new NotFoundError().status);
            expect(res.body).toEqual({message: new NotFoundError().message});
        });

        it('should handle errors and return 500 status', async () => {
            const userId = '123';
            const newEmail = 'new@example.com';

            mockJwt.getUserId.mockReturnValue(userId);
            (EmailCredentialsModel.emailExists as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            const res = await request(app)
                .patch(endpoint)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken())  // Add headers if needed
                .send({email: newEmail});

            expect(res.status).toBe(500);
        });
    });
});
