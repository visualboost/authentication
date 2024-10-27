import request from 'supertest';
import { User } from '../../../src/models/db/User';
import { UserModification } from '../../../src/models/db/UserModification';
import { MailHandler } from '../../../src/util/MailHandler';
import { app } from '../../../src/server/server';
import {Success} from "../../../src/models/api/Success.ts";
import BadRequestError from "../../../src/errors/BadRequestError.ts";
import {NextFunction, Request, Response} from "express";

jest.mock('../../../src/models/db/User');
jest.mock('../../../src/models/db/UserModification');
jest.mock('../../../src/util/MailHandler');

jest.mock('../../../src/server/middlewares/hasXsrfTokenMiddleware.ts', () => ({
    hasXsrfTokenMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

describe('POST /authentication/reset/password', () => {
    const endpoint = '/authentication/reset/password';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {
        it('should return 200 and send reset password email if user exists', async () => {
            const mockUser = { _id: 'user123', getCredentials: jest.fn().mockResolvedValue({ email: 'user@example.com' }), userName: 'testUser' };
            const mockModification = { createToken: jest.fn().mockResolvedValue('reset-token') };

            (User.getByEmail as jest.Mock).mockResolvedValueOnce(mockUser);
            (UserModification.createPasswordResetModificationObject as jest.Mock).mockResolvedValueOnce(mockModification);
            (MailHandler.sendResetPasswordMail as jest.Mock).mockResolvedValueOnce(true);

            const res = await request(app).post(endpoint).send({ email: 'user@example.com' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(new Success());
            expect(User.getByEmail).toHaveBeenCalledWith('user@example.com');
            expect(mockUser.getCredentials).toHaveBeenCalled();
            expect(UserModification.createPasswordResetModificationObject).toHaveBeenCalledWith('user123');
            expect(mockModification.createToken).toHaveBeenCalled();
            expect(MailHandler.sendResetPasswordMail).toHaveBeenCalledWith('user@example.com', 'testUser', 'reset-token');
        });

        it('should return Success if user does not exist. We return Success to avoid providing critical information to attackers.', async () => {
            (User.getByEmail as jest.Mock).mockResolvedValueOnce(null);

            const res = await request(app).post(endpoint).send({ email: 'nonexistent@example.com' });

            expect(res.body).toEqual(new Success());
            expect(User.getByEmail).toHaveBeenCalledWith('nonexistent@example.com');
        });

        it('should return 404 if credentials are missing. We return Success to avoid providing critical information to attackers.', async () => {
            const mockUser = { _id: 'user123', getCredentials: jest.fn().mockResolvedValue(null) };

            (User.getByEmail as jest.Mock).mockResolvedValueOnce(mockUser);

            const res = await request(app).post(endpoint).send({ email: 'user@example.com' });

            expect(res.body).toEqual(new Success());
            expect(User.getByEmail).toHaveBeenCalledWith('user@example.com');
            expect(mockUser.getCredentials).toHaveBeenCalled();
        });
    });

    describe('Error', () => {
        it('should return 400 if email is missing', async () => {
            const res = await request(app).post(endpoint).send({});

            expect(res.status).toBe(new BadRequestError().status);
            expect(res.body).toEqual({message: new BadRequestError().message});
        });

        it('should handle errors and return 500 status for unexpected errors', async () => {
            (User.getByEmail as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            const res = await request(app).post(endpoint).send({ email: 'user@example.com' });

            expect(res.status).toBe(500);
        });
    });
});
