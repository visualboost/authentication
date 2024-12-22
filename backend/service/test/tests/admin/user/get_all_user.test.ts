import request from 'supertest';
import {User} from '../../../../src/models/db/User.ts';
import {Settings} from '../../../../src/models/db/Settings.ts';
import {app} from '../../../../src/server/server.ts';
import {NextFunction, Request, Response} from "express";
import {UserState} from "../../../../src/constants/UserState.ts";
import {IEmailCredentials} from "../../../../src/models/db/credentials/EMailCredentials.ts";
import {UserSearchCriterias} from "../../../../src/constants/UserSearchCriterias.ts";
import {hasJwtMiddleware} from "../../../../src/server/middlewares/hasJwt.ts";
import {JwtHandler} from "../../../../src/util/JwtHandler.ts";
import {hasXsrfTokenMiddleware} from "../../../../src/server/middlewares/hasXsrfTokenMiddleware.ts";
import {isActiveMiddleware} from "../../../../src/server/middlewares/isActive.ts";
import {isAdminMiddleware} from "../../../../src/server/middlewares/isAdmin.ts";
import {createTestAdminToken} from "../../../util/JwtUtil.ts";
import {hasReadMultipleUserScope} from "../../../../src/server/middlewares/scope/hasUserScopeMiddleware.ts";

jest.mock('../../../../src/models/db/User.ts');
jest.mock('../../../../src/models/db/Settings.ts');

jest.mock('../../../../src/server/middlewares/hasJwt.ts', () => ({
    hasJwtMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        res.locals.authToken = JwtHandler.fromRequest(req)
        next();
    }),
}));

jest.mock('../../../../src/server/middlewares/isActive.ts', () => ({
    isActiveMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

jest.mock('../../../../src/server/middlewares/isAdmin.ts', () => ({
    isAdminMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

jest.mock('../../../../src/server/middlewares/hasXsrfTokenMiddleware.ts', () => ({
    hasXsrfTokenMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

jest.mock('../../../../src/server/middlewares/scope/hasUserScopeMiddleware.ts', () => ({
    hasReadMultipleUserScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
    hasWriteUserScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
    hasInviteUserScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
    hasChangeUserRoleScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    })
}));

describe('GET /admin/user', () => {
    const endpoint = '/admin/user';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {

        test('should return all non-blocked users when no query parameters are provided', async () => {
            const mockUsers = [
                {
                    _id: 'user123',
                    userName: 'testUser1',
                    confirmation: {state: UserState.ACTIVE},
                    role: 'admin',
                    createdAt: new Date(),
                    lastLogin: new Date(),
                    credentials: {email: 'test1@example.com'} as IEmailCredentials,
                },
                {
                    _id: 'user124',
                    userName: 'testUser2',
                    confirmation: {state: UserState.ACTIVE},
                    role: 'user',
                    createdAt: new Date(),
                    lastLogin: new Date(),
                    credentials: {email: 'test2@example.com'} as IEmailCredentials,
                },
            ];

            (User.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockUsers)
                })
            });
            (Settings.getEmailEncryptionEnabled as jest.Mock).mockResolvedValueOnce(false);

            const res = await request(app)
                .get(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken());

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].username).toBe('testUser1');
            expect(res.body[1].username).toBe('testUser2');
        });

        test('should return users filtered by username', async () => {
            const mockUser = {
                _id: 'user123',
                userName: 'testUser',
                confirmation: {state: UserState.ACTIVE},
                role: 'admin',
                createdAt: new Date(),
                lastLogin: new Date(),
                credentials: {email: 'test@example.com'} as IEmailCredentials,
            };

            (User.findAllByUsername as jest.Mock).mockResolvedValueOnce([mockUser]);
            (Settings.getEmailEncryptionEnabled as jest.Mock).mockResolvedValueOnce(false);

            const res = await request(app)
                .get(endpoint).query({value: 'testUser', type: UserSearchCriterias.USERNAME})
                .set('Authorization', 'Bearer ' + createTestAdminToken());

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].username).toBe('testUser');
            expect(User.findAllByUsername).toHaveBeenCalledWith('testUser');
        });

        test('should return users filtered by email', async () => {
            const mockUser = {
                _id: 'user123',
                userName: 'testUser',
                confirmation: {state: UserState.ACTIVE},
                role: 'admin',
                createdAt: new Date(),
                lastLogin: new Date(),
                credentials: {email: 'test@example.com'} as IEmailCredentials,
            };

            (User.findAllByEmail as jest.Mock).mockResolvedValueOnce([mockUser]);
            (Settings.getEmailEncryptionEnabled as jest.Mock).mockResolvedValueOnce(false);

            const res = await request(app)
                .get(endpoint).query({
                    value: 'test@example.com',
                    type: UserSearchCriterias.EMAIL
                }).set('Authorization', 'Bearer ' + createTestAdminToken());

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].username).toBe('testUser');
            expect(User.findAllByEmail).toHaveBeenCalledWith('test@example.com');
        });
    });

    describe('Error', () => {

        test('should return 500 if a database error occurs', async () => {
            (User.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockRejectedValueOnce(new Error('Database error'))
                })
            });

            const res = await request(app).get(endpoint).set('Authorization', 'Bearer ' + createTestAdminToken());

            expect(res.status).toBe(500);
            expect(res.body).toEqual({message: 'Database error'});
        });
    });

    describe('Middleware Tests', () => {

        it('should call hasJwtMiddleware', async () => {
            await request(app).get(endpoint);
            expect(hasJwtMiddleware).toHaveBeenCalled();
        });

        it('should call isActiveMiddleware', async () => {
            await request(app)
                .get(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken());
            expect(isActiveMiddleware).toHaveBeenCalled();
        });

        it('should call isAdminMiddleware', async () => {
            await request(app)
                .get(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken());
            expect(isAdminMiddleware).toHaveBeenCalled();
        });


        it('should call hasXsrfTokenMiddleware', async () => {
            const res = await request(app)
                .get(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken())
            expect(hasXsrfTokenMiddleware).toHaveBeenCalled();
        });

        it('should call has hasReadMultipleUserScope middleware', async () => {
            const res = await request(app)
                .get(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken())
            expect(hasReadMultipleUserScope).toHaveBeenCalled();
        });


    });
});
