import request from 'supertest';
import {User} from '../../../src/models/db/User';
import {Settings} from '../../../src/models/db/Settings';
import {ServerUtil} from '../../../src/util/ServerUtil.ts';
import {app} from '../../../src/server/server';
import {IPasswordChangeModification, UserModification} from '../../../src/models/db/UserModification';
import {NextFunction, Request, Response} from 'express';
import {hasModificationToken} from "../../../src/server/middlewares/hasModificationToken.ts";

jest.mock('../../../src/models/db/User');
jest.mock('../../../src/models/db/UserModification.ts');
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
        res.locals = {...res.locals, ...locals};
        next();
    });
    newApp.use(app);
    return newApp;
}

describe('GET /modification/password', () => {
    const endpoint = '/modification/password';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {
        test('should redirect to hook URL if provided in settings', async () => {
            const mockedModificationDoc = {
                userId: 'user123',
                metadata: {newPassword: 'newSecurePassword'},
                isPasswordChange: jest.fn().mockReturnValue(true),
            };

            const mockUser = {
                _id: 'user123',
                getCredentials: jest.fn().mockReturnValue({
                    save: jest.fn().mockResolvedValue(true)
                })
            };
            const hook = {url: 'https://hook.url/redirect'};

            (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);
            (UserModification.clearPasswordModifications as jest.Mock).mockResolvedValueOnce(true);
            (Settings.getPasswordChangeHook as jest.Mock).mockResolvedValueOnce(hook);

            const appWithLocals = addLocals(app, {modificationDoc: mockedModificationDoc});
            const res = await request(appWithLocals).get(endpoint);

            expect(res.status).toBe(302);
            expect(res.header.location).toBe('https://hook.url/redirect');
            expect(User.findById).toHaveBeenCalledWith('user123');
        });

        test('should redirect to default frontend URL if hook is not provided', async () => {
            const mockModification: IPasswordChangeModification = {
                userId: 'user123',
                metadata: {newPassword: 'newSecurePassword'},
                isPasswordChange: jest.fn().mockReturnValue(true),
            } as any;

            const mockUser = {_id: 'user123', getCredentials: jest.fn().mockReturnValue({
                    save: jest.fn().mockResolvedValue(true)
                })};

            (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);
            (Settings.getEmailChangeHook as jest.Mock).mockResolvedValueOnce(null);
            (ServerUtil.getConfirmChangedPasswordUrl as jest.Mock).mockReturnValueOnce('https://frontend.url/password-changed');

            const appWithLocals = addLocals(app, {modificationDoc: mockModification});
            const res = await request(appWithLocals).get(endpoint);

            expect(res.status).toBe(302);
            expect(res.header.location).toBe('https://frontend.url/password-changed');
            expect(ServerUtil.getConfirmChangedPasswordUrl).toHaveBeenCalled();
            expect(User.findById).toHaveBeenCalledWith('user123');
        });
    });

    describe('Error', () => {
        test('should return 403 if modification is not of type PASSWORD_CHANGE', async () => {
            const mockModification: IPasswordChangeModification = {
                userId: 'user123',
                metadata: {newPassword: 'newSecurePassword'},
                isPasswordChange: jest.fn().mockReturnValue(false),
            } as any;

            const appWithLocals = addLocals(app, {modificationDoc: mockModification});
            const res = await request(appWithLocals).get(endpoint);

            expect(res.status).toBe(403);
        });

        test('should return 404 if user is not found', async () => {
            const mockModification: IPasswordChangeModification = {
                userId: 'user123',
                metadata: {newPassword: 'newSecurePassword'},
                isPasswordChange: jest.fn().mockReturnValue(true),
            } as any;

            (User.findById as jest.Mock).mockResolvedValueOnce(null);

            const appWithLocals = addLocals(app, {modificationDoc: mockModification});
            const res = await request(appWithLocals).get(endpoint);
            expect(res.status).toBe(404);
        });

        test('should return 500 for unexpected errors', async () => {
            const mockModification: IPasswordChangeModification = {
                userId: 'user123',
                metadata: {newPassword: 'newSecurePassword'},
                isPasswordChange: jest.fn().mockReturnValue(true),
            } as any;

            (User.findById as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            const appWithLocals = addLocals(app, {modificationDoc: mockModification});
            const res = await request(appWithLocals).get(endpoint);
            expect(res.status).toBe(500);
        });
    });

    it('should call hasModificationToken', async () => {
        const res = await request(app).get(endpoint);
        expect(hasModificationToken).toHaveBeenCalled();
    });
});
