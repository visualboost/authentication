import request from 'supertest';
import {NextFunction, Request, Response} from 'express';
import {createTestAdminToken} from '../../../util/JwtUtil.ts';
import {app} from '../../../../src/server/server.ts';
import {Role} from '../../../../src/models/db/Roles.ts';
import {hasWriteRoleScope} from '../../../../src/server/middlewares/scope/hasRoleScopesMiddleware.ts';
import {hasXsrfTokenMiddleware} from '../../../../src/server/middlewares/hasXsrfTokenMiddleware.ts';
import {isActiveMiddleware} from '../../../../src/server/middlewares/isActive.ts';
import {JwtHandler} from '../../../../src/util/JwtHandler.ts';
import BadRequestError from '../../../../src/errors/BadRequestError.ts';
import ConflictError from '../../../../src/errors/ConflictError.ts';
import Scope from "../../../../src/constants/role/Scope.ts";

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

describe('POST /admin/role', () => {
    const endpoint = '/admin/role';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {
        it('should return 200 and role with scopes when user has WRITE and READ scopes', async () => {
            const roleName = 'NewRole';
            const roleDescription = 'Test role';

            (hasWriteRoleScope as jest.Mock).mockImplementationOnce(
                (req: Request, res: Response, next: NextFunction) => {
                    res.locals.authToken = {
                        containsScopes: (scope: string) => scope === Scope.Scopes.WRITE || scope === Scope.Scopes.READ,
                    };
                    next();
                },
            );
            (Role.roleExists as jest.Mock).mockResolvedValueOnce(false);
            (Role.prototype.save as jest.Mock).mockResolvedValueOnce(true);
            (Role.prototype.constructor as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data);
                this._id = 'generatedId';
                this.createdAt = '2024-12-24';
            });
            const res = await request(app)
                .post(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken('userWithWriteAndRead'))
                .send({name: roleName, description: roleDescription, scopes: ['TEST_SCOPE']});
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                id: 'generatedId',
                name: 'NewRole',
                description: 'Test role',
                createdAt: '2024-12-24',
                scopes: ['TEST_SCOPE'],
            });
        });

        it('should return 200 and role without scopes when user has WRITE but not READ scope', async () => {
            const roleName = 'AnotherRole';
            const roleDescription = 'Another role description';
            (hasWriteRoleScope as jest.Mock).mockImplementationOnce(
                (req: Request, res: Response, next: NextFunction) => {
                    res.locals.authToken = {
                        containsScopes: (scope: string) => scope === Scope.Scopes.WRITE,
                    };
                    next();
                },
            );
            (Role.roleExists as jest.Mock).mockResolvedValueOnce(false);
            (Role.prototype.save as jest.Mock).mockResolvedValueOnce(true);
            (Role.prototype.constructor as jest.Mock).mockImplementation(function (this: any, data: any) {
                    Object.assign(this, data);
                    this._id = 'generatedId2';
                    this.createdAt = '2024-12-25';
            });

            const res = await request(app)
                .post(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken('userWithWriteOnly'))
                .send({name: roleName, description: roleDescription, scopes: ['ANY_SCOPE']});
            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                id: 'generatedId2',
                name: 'AnotherRole',
                description: 'Another role description',
                createdAt: '2024-12-25',
                scopes: []
            });
        });
    });

    describe('Error', () => {
        it('should return 400 when role name is missing', async () => {
            const res = await request(app)
                .post(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken('userId'))
                .send({description: 'No name here'});
            expect(res.status).toBe(new BadRequestError().status);
            expect(res.body).toEqual({message: new BadRequestError().message});
        });

        it('should return 409 when role already exists', async () => {
            const roleName = 'ExistingRole';
            (Role.roleExists as jest.Mock).mockResolvedValueOnce(true);
            const res = await request(app)
                .post(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken('userWithWrite'))
                .send({name: roleName, description: 'Conflict role'});
            expect(res.status).toBe(new ConflictError().status);
            expect(res.body).toEqual({message: new ConflictError().message});
        });

        it('should return 500 when a database error occurs', async () => {
            (Role.roleExists as jest.Mock).mockRejectedValueOnce(new Error('DB crash'));
            const res = await request(app)
                .post(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken('userId'))
                .send({name: 'CrashRole', description: 'Should crash'});
            expect(res.status).toBe(500);
        });
    });

    describe('Middleware', () => {
        it('should call hasXsrfTokenMiddleware', async () => {
            await request(app).post(endpoint).set('Authorization', 'Bearer ' + createTestAdminToken()).send({
                name: 'Test',
                description: 'Test'
            });
            expect(hasXsrfTokenMiddleware).toHaveBeenCalled();
        });

        it('should call isActiveMiddleware', async () => {
            await request(app).post(endpoint).set('Authorization', 'Bearer ' + createTestAdminToken()).send({
                name: 'Test',
                description: 'Test'
            });
            expect(isActiveMiddleware).toHaveBeenCalled();
        });

        it('should call hasWriteRoleScope', async () => {
            await request(app).post(endpoint).set('Authorization', 'Bearer ' + createTestAdminToken()).send({
                name: 'Test',
                description: 'Test'
            });
            expect(hasWriteRoleScope).toHaveBeenCalled();
        });
    });
});
