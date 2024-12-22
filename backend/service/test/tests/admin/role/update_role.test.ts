import request from 'supertest';
import { NextFunction, Request, Response } from 'express';
import { createTestAdminToken } from '../../../util/JwtUtil.ts';
import { app } from '../../../../src/server/server.ts';
import { Role } from '../../../../src/models/db/Roles.ts';
import { hasWriteRoleScope } from '../../../../src/server/middlewares/scope/hasRoleScopesMiddleware.ts';
import { hasXsrfTokenMiddleware } from '../../../../src/server/middlewares/hasXsrfTokenMiddleware.ts';
import { isActiveMiddleware } from '../../../../src/server/middlewares/isActive.ts';
import { JwtHandler } from '../../../../src/util/JwtHandler.ts';
import BadRequestError from '../../../../src/errors/BadRequestError.ts';
import NotFoundError from '../../../../src/errors/NotFoundError.ts';
import Scope from '../../../../src/constants/role/Scope.ts';
import { RoleResponse } from '../../../../src/models/api/RoleResponse'; // adjust if needed

jest.mock('../../../../src/models/db/Roles.ts');

jest.mock('../../../../src/server/middlewares/hasJwt.ts', () => ({
    hasJwtMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        res.locals.authToken = JwtHandler.fromRequest(req);
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
    }),
}));

describe('PUT /admin/role/:id', () => {
    const endpoint = '/admin/role';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {
        it('should return 200 and updated role with scopes when user has WRITE and READ scopes', async () => {
            (hasWriteRoleScope as jest.Mock).mockImplementationOnce(
                (req: Request, res: Response, next: NextFunction) => {
                    res.locals.authToken = {
                        containsScopes: (scope: string) => scope === Scope.Scopes.WRITE || scope === Scope.Scopes.READ,
                    };
                    next();
                },
            );
            const roleId = '123';
            const existingRole = {
                _id: roleId,
                name: 'OldRole',
                description: 'Old description',
                createdAt: '2024-12-24',
                scopes: ['OLD_SCOPE'],
            };
            (Role.findOne as jest.Mock).mockResolvedValueOnce(existingRole);
            const updatedRole = {
                _id: roleId,
                name: 'NewRole',
                description: 'New description',
                createdAt: '2024-12-24',
                scopes: ['NEW_SCOPE'],
            };
            (Role.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(updatedRole);
            const res = await request(app)
                .put(`${endpoint}/${roleId}`)
                .set('Authorization', 'Bearer ' + createTestAdminToken('userWithWriteAndRead'))
                .send({ name: 'NewRole', description: 'New description', scopes: ['NEW_SCOPE'] });
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                id: '123',
                name: 'NewRole',
                description: 'New description',
                createdAt: '2024-12-24',
                scopes: ['NEW_SCOPE'],
            });
        });

        it('should return 200 and updated role without scopes when user has WRITE but not READ', async () => {
            (hasWriteRoleScope as jest.Mock).mockImplementationOnce(
                (req: Request, res: Response, next: NextFunction) => {
                    res.locals.authToken = {
                        containsScopes: (scope: string) => scope === Scope.Scopes.WRITE,
                    };
                    next();
                },
            );
            const roleId = '456';
            const existingRole = {
                _id: roleId,
                name: 'AnotherOldRole',
                description: 'Another old desc',
                createdAt: '2024-12-25',
                scopes: ['OLD_SCOPE'],
            };
            (Role.findOne as jest.Mock).mockResolvedValueOnce(existingRole);
            const updatedRole = {
                _id: roleId,
                name: 'AnotherNewRole',
                description: 'Another new desc',
                createdAt: '2024-12-25',
                scopes: ['ANY_SCOPE'],
            };
            (Role.findOneAndUpdate as jest.Mock).mockResolvedValueOnce(updatedRole);
            const res = await request(app)
                .put(`${endpoint}/${roleId}`)
                .set('Authorization', 'Bearer ' + createTestAdminToken('userWithWriteOnly'))
                .send({ name: 'AnotherNewRole', description: 'Another new desc', scopes: ['ANY_SCOPE'] });
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                id: '456',
                name: 'AnotherNewRole',
                description: 'Another new desc',
                createdAt: '2024-12-25',
                scopes: []
            });
        });
    });

    describe('Error', () => {
        it('should return 400 when name is missing', async () => {
            let res = await request(app)
                .put(`${endpoint}/789`)
                .set('Authorization', 'Bearer ' + createTestAdminToken('userId'))
                .send({ description: 'No name' });
            expect(res.status).toBe(new BadRequestError().status);
            expect(res.body).toEqual({ message: new BadRequestError().message });
        });

        it('should return 404 when role is not found', async () => {
            const roleId = 'notFoundId';
            (Role.findOne as jest.Mock).mockResolvedValueOnce(null);
            const res = await request(app)
                .put(`${endpoint}/${roleId}`)
                .set('Authorization', 'Bearer ' + createTestAdminToken('userId'))
                .send({ name: 'NewName' });
            expect(res.status).toBe(new NotFoundError().status);
            expect(res.body).toEqual({ message: new NotFoundError().message });
        });

        it('should return 500 when a database error occurs', async () => {
            const roleId = 'crashId';
            (Role.findOne as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
            const res = await request(app)
                .put(`${endpoint}/${roleId}`)
                .set('Authorization', 'Bearer ' + createTestAdminToken('userId'))
                .send({ name: 'NewName' });
            expect(res.status).toBe(500);
        });
    });

    describe('Middleware', () => {
        it('should call hasXsrfTokenMiddleware', async () => {
            await request(app)
                .put(`${endpoint}/testId`)
                .set('Authorization', 'Bearer ' + createTestAdminToken())
                .send({ name: 'Test' });
            expect(hasXsrfTokenMiddleware).toHaveBeenCalled();
        });

        it('should call isActiveMiddleware', async () => {
            await request(app)
                .put(`${endpoint}/testId`)
                .set('Authorization', 'Bearer ' + createTestAdminToken())
                .send({ name: 'Test' });
            expect(isActiveMiddleware).toHaveBeenCalled();
        });

        it('should call hasWriteRoleScope', async () => {
            await request(app)
                .put(`${endpoint}/testId`)
                .set('Authorization', 'Bearer ' + createTestAdminToken())
                .send({ name: 'Test' });
            expect(hasWriteRoleScope).toHaveBeenCalled();
        });
    });
});
