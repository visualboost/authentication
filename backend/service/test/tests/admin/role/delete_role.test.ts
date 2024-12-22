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

describe('DELETE /admin/role/:id', () => {
    const endpoint = '/admin/role';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {
        it('should return 200 and role with scopes if user has WRITE and READ', async () => {
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
                name: 'TestRole',
                description: 'Test description',
                createdAt: '2024-12-24',
                scopes: ['SCOPE_A'],
            };
            (Role.findOne as jest.Mock).mockResolvedValueOnce(existingRole);
            (Role.deleteRole as jest.Mock).mockResolvedValueOnce(true);
            const res = await request(app)
                .delete(`${endpoint}/${roleId}`)
                .set('Authorization', 'Bearer ' + createTestAdminToken('withWriteAndRead'));
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                id: '123',
                name: 'TestRole',
                description: 'Test description',
                createdAt: '2024-12-24',
                scopes: ['SCOPE_A'],
            });
        });

        it('should return 200 and role without scopes if user has WRITE but not READ', async () => {
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
                name: 'AnotherRole',
                description: 'Another desc',
                createdAt: '2024-12-25',
                scopes: ['SCOPE_X'],
            };
            (Role.findOne as jest.Mock).mockResolvedValueOnce(existingRole);
            (Role.deleteRole as jest.Mock).mockResolvedValueOnce(true);
            const res = await request(app)
                .delete(`${endpoint}/${roleId}`)
                .set('Authorization', 'Bearer ' + createTestAdminToken('withWriteOnly'));
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                id: '456',
                name: 'AnotherRole',
                description: 'Another desc',
                createdAt: '2024-12-25',
                scopes: []
            });
        });
    });

    describe('Error', () => {
        it('should return 404 when role does not exist', async () => {
            const roleId = 'notFoundId';
            (Role.findOne as jest.Mock).mockResolvedValueOnce(null);
            const res = await request(app)
                .delete(`${endpoint}/${roleId}`)
                .set('Authorization', 'Bearer ' + createTestAdminToken());
            expect(res.status).toBe(new NotFoundError().status);
            expect(res.body).toEqual({ message: new NotFoundError().message });
        });

        it('should return 500 when a database error occurs', async () => {
            const roleId = 'crashId';
            (Role.findOne as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
            const res = await request(app)
                .delete(`${endpoint}/${roleId}`)
                .set('Authorization', 'Bearer ' + createTestAdminToken());
            expect(res.status).toBe(500);
        });
    });

    describe('Middleware', () => {
        it('should call hasXsrfTokenMiddleware', async () => {
            await request(app)
                .delete(`${endpoint}/testId`)
                .set('Authorization', 'Bearer ' + createTestAdminToken());
            expect(hasXsrfTokenMiddleware).toHaveBeenCalled();
        });

        it('should call isActiveMiddleware', async () => {
            await request(app)
                .delete(`${endpoint}/testId`)
                .set('Authorization', 'Bearer ' + createTestAdminToken());
            expect(isActiveMiddleware).toHaveBeenCalled();
        });

        it('should call hasWriteRoleScope', async () => {
            await request(app)
                .delete(`${endpoint}/testId`)
                .set('Authorization', 'Bearer ' + createTestAdminToken());
            expect(hasWriteRoleScope).toHaveBeenCalled();
        });
    });
});
