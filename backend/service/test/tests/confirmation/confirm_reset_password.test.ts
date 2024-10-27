import request from 'supertest';
import { Settings } from '../../../src/models/db/Settings';
import { ServerUtil } from '../../../src/util/ServerUtil.ts';
import { app } from '../../../src/server/server';
import { IUserModification } from '../../../src/models/db/UserModification';
import { NextFunction, Request, Response } from 'express';
import ForbiddenError from "../../../src/errors/ForbiddenError.ts";

jest.mock('../../../src/models/db/Settings');
jest.mock('../../../src/util/ServerUtil.ts');

//@ts-ignore
jest.mock('../../../src/server/middlewares/hasModificationToken', () => ({
    hasModificationToken: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

function addLocals(app: any, locals: object) {
    const express = require('express');
    const newApp = express();
    newApp.use((req: Request, res: Response, next: NextFunction) => {
        res.locals = { ...res.locals, ...locals };
        next();
    });
    newApp.use(app);
    return newApp;
}

describe('GET /confirm/password/reset', () => {
    const endpoint = '/confirm/password/reset';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {
        it('should redirect to hook URL if provided in settings', async () => {
            const mockModificationDoc = {
                isPasswordReset: jest.fn().mockReturnValue(true)
            } as unknown as IUserModification;

            const hook = { url: 'https://hook.url/redirect' };

            (Settings.getResetPasswordHook as jest.Mock).mockResolvedValueOnce(hook);

            const appWithLocals = addLocals(app, { modificationDoc: mockModificationDoc, modificationToken: "myModificationToken" });
            const res = await request(appWithLocals).get(endpoint);

            expect(res.status).toBe(302);
            expect(res.header.location).toBe('https://hook.url/redirect?token=myModificationToken');
            expect(Settings.getResetPasswordHook).toHaveBeenCalled();
            expect(mockModificationDoc.isPasswordReset).toHaveBeenCalled();
        });

        it('should redirect to default frontend URL if hook is not provided', async () => {
            const mockModificationDoc = {
                _id: "myModificationId",
                isPasswordReset: jest.fn().mockReturnValue(true),
            } as unknown as IUserModification;

            (Settings.getResetPasswordHook as jest.Mock).mockResolvedValueOnce(null);
            (ServerUtil.getResetPasswordUrl as jest.Mock).mockReturnValueOnce('https://frontend.url/user/myModificationId/password');

            const appWithLocals = addLocals(app, { modificationDoc: mockModificationDoc, modificationToken: "myModificationToken" });
            const res = await request(appWithLocals).get(endpoint);

            expect(res.status).toBe(302);
            expect(res.header.location).toBe('https://frontend.url/user/myModificationId/password?token=myModificationToken');
            expect(Settings.getResetPasswordHook).toHaveBeenCalled();
            expect(ServerUtil.getResetPasswordUrl).toHaveBeenCalled();
            expect(mockModificationDoc.isPasswordReset).toHaveBeenCalled();
        });
    });

    describe('Error', () => {

        it('should return 403 if modification is not of type PASSWORD_RESET', async () => {
            const mockModificationDoc = {
                isPasswordReset: jest.fn().mockReturnValue(false),
            } as unknown as IUserModification;

            const appWithLocals = addLocals(app, { modificationDoc: mockModificationDoc });
            const res = await request(appWithLocals).get(endpoint);

            expect(res.status).toBe(new ForbiddenError().status);
            expect(res.body).toEqual({ message: new ForbiddenError().message });
            expect(mockModificationDoc.isPasswordReset).toHaveBeenCalled();
        });

        it('should handle errors and return 500 status for unexpected errors', async () => {
            const mockModificationDoc = {
                isPasswordReset: jest.fn().mockReturnValue(true),
            } as unknown as IUserModification;

            (Settings.getResetPasswordHook as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            const appWithLocals = addLocals(app, { modificationDoc: mockModificationDoc });
            const res = await request(appWithLocals).get(endpoint);

            expect(res.status).toBe(500);
            expect(Settings.getResetPasswordHook).toHaveBeenCalled();
        });
    });
});
