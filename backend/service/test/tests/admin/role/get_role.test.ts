import request from 'supertest';
import {NextFunction, Request, Response} from "express";
import {createTestAdminToken} from "../../../util/JwtUtil.ts";
import {app} from "../../../../src/server/server.ts";
import {Role} from "../../../../src/models/db/Roles.ts";
import {hasReadRoleScope} from "../../../../src/server/middlewares/scope/hasRoleScopesMiddleware.ts";
import NotFoundError from "../../../../src/errors/NotFoundError.ts";
import {hasXsrfTokenMiddleware} from "../../../../src/server/middlewares/hasXsrfTokenMiddleware.ts";
import {JwtHandler} from "../../../../src/util/JwtHandler.ts";
import {isActiveMiddleware} from "../../../../src/server/middlewares/isActive.ts";

jest.mock('../../../../src/models/db/Roles.ts');

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

jest.mock('../../../../src/server/middlewares/hasXsrfTokenMiddleware.ts', () => ({
    hasXsrfTokenMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

jest.mock('../../../../src/server/middlewares/scope/hasRoleScopesMiddleware.ts', () => ({
    hasReadRoleScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
    hasWriteRoleScope: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    })
}));

describe('GET /admin/role/:id', () => {
    const endpoint = '/admin/role';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {
        it('should return 200 and role with scopes if authToken contains Scope.Scopes.READ', async () => {
            const roleId = 'abc123';
            const roleMock = {
                _id: roleId,
                name: 'Admin',
                description: 'Administrator role',
                createdAt: '2024-12-20',
                scopes: ['SOME_SCOPE', 'OTHER_SCOPE'],
            };

            (Role.findOne as jest.Mock).mockReturnValue({
                lean: jest.fn().mockResolvedValueOnce(roleMock)
            });

            const res = await request(app)
                .get(`${endpoint}/${roleId}`)
                .set('Authorization', 'Bearer ' + createTestAdminToken('someUserId'));

            expect(res.status).toBe(200);

            expect(res.body).toEqual({
                id: roleId,
                name: 'Admin',
                description: 'Administrator role',
                createdAt: '2024-12-20',
                scopes: ['SOME_SCOPE', 'OTHER_SCOPE'],
            });
            expect(Role.findOne).toHaveBeenCalledWith({_id: roleId});
        });

        it('should return 200 and role without scopes if authToken does NOT contain Scope.Scopes.READ', async () => {
            // Arrange
            const roleId = 'def456';
            const roleMock = {
                _id: roleId,
                name: 'User',
                description: 'User role',
                createdAt: '2024-12-21',
                scopes: ['SOME_SCOPE'],
            };

            (hasReadRoleScope as jest.Mock).mockImplementationOnce(
                (req: Request, res: Response, next: NextFunction) => {
                    res.locals.authToken = {
                        containsScopes: jest.fn().mockReturnValue(false),
                    };
                    next();
                },
            );

            (Role.findOne as jest.Mock).mockReturnValue({
                lean: jest.fn().mockResolvedValueOnce(roleMock)
            });

            const res = await request(app)
                .get(`${endpoint}/${roleId}`)
                .set('Authorization', 'Bearer ' + createTestAdminToken('otherUserId'));

            expect(res.status).toBe(200);

            expect(res.body).toEqual({
                id: roleId,
                name: 'User',
                description: 'User role',
                createdAt: '2024-12-21',
                scopes: []
            });
            expect(Role.findOne).toHaveBeenCalledWith({_id: roleId});
        });
    });

    describe('Error', () => {

        it('should return 404 (NotFoundError) if the role is not found', async () => {
            const nonExistingRoleId = 'nonExistingId';

            (Role.findOne as jest.Mock).mockReturnValue({
                lean: jest.fn().mockResolvedValueOnce(null)
            });

            const res = await request(app)
                .get(`${endpoint}/${nonExistingRoleId}`)
                .set('Authorization', 'Bearer ' + createTestAdminToken('otherUserId'));

            expect(res.status).toBe(new NotFoundError().status);
            expect(res.body).toEqual({message: new NotFoundError().message});
        });

        it('should return 500 if an unexpected error occurs (e.g. DB error)', async () => {
            const roleId = 'crashID';

            (Role.findOne as jest.Mock).mockReturnValue({
                lean: jest.fn().mockResolvedValueOnce(new Error('Database error'))
            });

            const res = await request(app)
                .get(`${endpoint}/${roleId}`)
                .set('Authorization', 'Bearer ' + createTestAdminToken('otherUserId'));

            expect(res.status).toBe(500);
        });
    });

    describe('Middleware Tests', () => {
        it('should call hasXsrfTokenMiddleware', async () => {
            await request(app).get(`${endpoint}/testId`).set('Authorization', 'Bearer ' + createTestAdminToken());
            expect(hasXsrfTokenMiddleware).toHaveBeenCalled();
        });

        it('should call isActiveMiddleware', async () => {
            await request(app).get(`${endpoint}/testId`).set('Authorization', 'Bearer ' + createTestAdminToken());
            expect(isActiveMiddleware).toHaveBeenCalled();
        });

        it('should call hasReadRoleScope', async () => {
            await request(app).get(`${endpoint}/testId`).set('Authorization', 'Bearer ' + createTestAdminToken());
            expect(hasReadRoleScope).toHaveBeenCalled();
        });


    });
});
