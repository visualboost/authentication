import request from 'supertest';
import {User} from '../../../src/models/db/User';
import {app} from '../../../src/server/server';
import {IUserModification} from '../../../src/models/db/UserModification';
import BadRequestError from '../../../src/errors/BadRequestError';
import NotFoundError from '../../../src/errors/NotFoundError';
import {NextFunction, Request, Response} from "express";
import {hasModificationToken} from "../../../src/server/middlewares/hasModificationToken.ts";
import {Success} from "../../../src/models/api/Success.ts";
import {CookieNames} from "../../../src/constants/CookieNames.ts";

jest.mock('../../../src/models/db/User');
jest.mock('../../../src/models/db/Settings');
jest.mock('../../../src/util/ServerUtil.ts');

jest.mock('../../../src/server/middlewares/hasModificationToken', () => ({
    hasModificationToken: jest.fn((req, res, next) => {
        next();
    }),
}));

function addLocals(app: any, locals: object) {
    const express = require('express');
    const newApp = express();
    newApp.use((req: Request, res: Response, next: NextFunction) => {
        res.locals = {...res.locals, ...locals};
        next();
    });
    newApp.use(app);
    return newApp;
}

describe('PATCH /modification/password', () => {
    const endpoint = '/modification/password';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {
        const endpoint = '/modification/password';

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should set the new password and return success response', async () => {
            const mockModificationDoc = {
                userId: 'user123',
                isPasswordReset: jest.fn().mockReturnValue(true),
            } as unknown as IUserModification;

            const mockUser = {_id: 'user123', setPassword: jest.fn().mockResolvedValue(undefined)};

            (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);

            const appWithLocals = addLocals(app, {modificationDoc: mockModificationDoc});
            const res = await request(appWithLocals).patch(endpoint).send({password: 'newPassword123!'});

            expect(res.status).toBe(200);
            expect(res.body).toEqual(new Success());
            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(mockUser.setPassword).toHaveBeenCalledWith('newPassword123!');
        });

        it('should call res.clearCookie', async () => {
            const mockModificationDoc = {
                userId: 'user123',
                isPasswordReset: jest.fn().mockReturnValue(true),
            } as unknown as IUserModification;

            const mockUser = {_id: 'user123', setPassword: jest.fn().mockResolvedValue(undefined)};
            (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);

            const appWithLocals = addLocals(app, {modificationDoc: mockModificationDoc});
            const res = await request(appWithLocals).patch(endpoint).send({password: 'newPassword123!'});

            expect(res.status).toBe(200);
            expect(res.header['set-cookie'][0]).toContain(`${CookieNames.AUTH_TOKEN}=; Path=/;`);
        });
    });

    describe('Error', () => {
        it('should return 400 if modification is not of type PASSWORD_RESET or password is missing', async () => {
            const mockModificationDoc = {
                userId: 'user123',
                isPasswordReset: jest.fn().mockReturnValue(false),
            } as unknown as IUserModification;

            const appWithLocals = addLocals(app, {modificationDoc: mockModificationDoc});
            const res = await request(appWithLocals).patch(endpoint).send({password: ''});

            expect(res.status).toBe(400);
            expect(res.body).toEqual({message: new BadRequestError().message});
            expect(mockModificationDoc.isPasswordReset).toHaveBeenCalled();
        });

        it('should return 404 if user is not found', async () => {
            const mockModificationDoc = {
                userId: 'user123',
                isPasswordReset: jest.fn().mockReturnValue(true),
            } as unknown as IUserModification;

            (User.findById as jest.Mock).mockResolvedValueOnce(null);

            const appWithLocals = addLocals(app, {modificationDoc: mockModificationDoc});
            const res = await request(appWithLocals).patch(endpoint).send({password: 'newPassword123!'});

            expect(res.status).toBe(404);
            expect(res.body).toEqual({message: new NotFoundError().message});
            expect(User.findById).toHaveBeenCalledWith('user123');
        });

        it('should handle errors and return 500 status for unexpected errors', async () => {
            const mockModificationDoc = {
                userId: 'user123',
                isPasswordReset: jest.fn().mockReturnValue(true),
            } as unknown as IUserModification;

            (User.findById as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            const appWithLocals = addLocals(app, {modificationDoc: mockModificationDoc});
            const res = await request(appWithLocals).patch(endpoint).send({password: 'newPassword123!'});

            expect(res.status).toBe(500);
        });
    });

    describe('Middleware Tests', () => {

        it('should call hasModificationToken', async () => {
            const res = await request(app).get(endpoint);
            expect(hasModificationToken).toHaveBeenCalled();
        });

    });
});
