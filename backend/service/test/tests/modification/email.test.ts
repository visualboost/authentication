import request from 'supertest';
import {User} from '../../../src/models/db/User';
import {Settings} from '../../../src/models/db/Settings';
import {ServerUtil} from '../../../src/util/ServerUtil.ts';
import {app} from '../../../src/server/server.ts';
import {IEmailModification} from '../../../src/models/db/UserModification';
import {NextFunction, Request, Response} from "express";
import {hasModificationToken} from "../../../src/server/middlewares/hasModificationToken.ts";

jest.mock('../../../src/models/db/User');
jest.mock('../../../src/models/db/Settings');
jest.mock('../../../src/util/ServerUtil.ts');
jest.mock('../../../src/models/db/UserModification');

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


describe('GET /modification/email', () => {
    const endpoint = '/modification/email';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {

        test('should redirect to hook URL if provided in settings', async () => {
            const mockedModificationDoc = {
                userId: 'user123',
                metadata: {newEmail: 'newemail@example.com', originMail: "originalMail@example.com"},
                isEmail: jest.fn().mockReturnValue(true),
            };

            const mockUser = {_id: 'user123', setEmail: jest.fn().mockResolvedValue(undefined)};
            const hook = {url: 'https://hook.url/redirect'};

            (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);
            (Settings.getEmailChangeHook as jest.Mock).mockResolvedValueOnce(hook);

            const appWithLocals = addLocals(app, {modificationDoc: mockedModificationDoc});
            const res = await request(appWithLocals).get(endpoint);

            expect(res.status).toBe(302);
            expect(res.header.location).toBe('https://hook.url/redirect');
            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(mockedModificationDoc.isEmail).toHaveBeenCalled();
        });

        test('should redirect to default frontend URL if hook is not provided', async () => {
            const mockModification: IEmailModification = {
                userId: 'user123',
                metadata: {newEmail: 'newemail@example.com'},
                isEmail: jest.fn().mockReturnValue(true),
            } as any;

            const mockUser = {_id: 'user123', setEmail: jest.fn().mockResolvedValue(undefined)};

            (User.findById as jest.Mock).mockResolvedValueOnce(mockUser);
            (Settings.getEmailChangeHook as jest.Mock).mockResolvedValueOnce(null);
            (ServerUtil.getChangedEmailUrl as jest.Mock).mockReturnValue('https://frontend.url/email-changed');

            const appWithLocals = addLocals(app, {modificationDoc: mockModification});
            const res = await request(appWithLocals).get(endpoint);

            expect(res.status).toBe(302);
            expect(res.header.location).toBe('https://frontend.url/email-changed');
            expect(ServerUtil.getChangedEmailUrl).toHaveBeenCalledTimes(1)
            expect(User.findById).toHaveBeenCalledWith('user123');
        });

    });

    describe('Error', () => {
        test('should return 403 if modification is not of type EMAIL', async () => {
            const mockModification: IEmailModification = {
                userId: 'user123',
                metadata: {newEmail: 'newemail@example.com'},
                isEmail: jest.fn().mockReturnValue(false),
            } as any;

            const appWithLocals = addLocals(app, {modificationDoc: mockModification});
            const res = await request(appWithLocals).get(endpoint);

            expect(res.status).toBe(403);
        });

        test('should return 404 if user is not found', async () => {
            const mockModification: IEmailModification = {
                userId: 'user123',
                metadata: {newEmail: 'newemail@example.com'},
                isEmail: jest.fn().mockReturnValue(true),
            } as any;

            (User.findById as jest.Mock).mockResolvedValueOnce(null);

            const appWithLocals = addLocals(app, {modificationDoc: mockModification});
            const res = await request(appWithLocals).get(endpoint);
            expect(res.status).toBe(404);
        });

        test('should return 500 for unexpected errors', async () => {
            const mockModification: IEmailModification = {
                userId: 'user123',
                metadata: {newEmail: 'newemail@example.com'},
                isEmail: jest.fn().mockReturnValue(true),
            } as any;

            (User.findById as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            const appWithLocals = addLocals(app, {modificationDoc: mockModification});
            const res = await request(appWithLocals).get(endpoint);
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

