import request from 'supertest';
import {NextFunction, Request, Response} from 'express';
import {createTestAdminToken} from '../../../util/JwtUtil.ts';
import {app} from '../../../../src/server/server.ts';
import {Role} from '../../../../src/models/db/Roles.ts';
import {hasReadRoleScope} from '../../../../src/server/middlewares/scope/hasRoleScopesMiddleware.ts';
import {hasXsrfTokenMiddleware} from '../../../../src/server/middlewares/hasXsrfTokenMiddleware.ts';
import {isActiveMiddleware} from '../../../../src/server/middlewares/isActive.ts';
import {JwtHandler} from '../../../../src/util/JwtHandler.ts';
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

describe('GET /admin/roles', () => {
    const endpoint = '/admin/roles';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {
        it('should return 200 and roles with scopes when auth token has READ scope', async () => {
            (hasReadRoleScope as jest.Mock).mockImplementationOnce(
                (req: Request, res: Response, next: NextFunction) => {
                    res.locals.authToken = {
                        containsScopes: jest.fn().mockImplementation((scope: string) => scope === Scope.Scopes.READ),
                    };
                    next();
                },
            );
            const roleMockArray = [
                {_id: '123', name: 'Admin', description: 'Administrator', createdAt: '2024-12-20', scopes: ['A', 'B']},
                {_id: '456', name: 'User', description: 'User role', createdAt: '2024-12-21', scopes: ['U']},
            ];
            (Role.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValueOnce(roleMockArray),
                }),
            });
            const res = await request(app)
                .get(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken('someUserId'));
            expect(res.status).toBe(200);
            expect(res.body).toEqual([
                {id: '123', name: 'Admin', description: 'Administrator', createdAt: '2024-12-20', scopes: ['A', 'B']},
                {id: '456', name: 'User', description: 'User role', createdAt: '2024-12-21', scopes: ['U']},
            ]);
        });

        it('should return 200 and roles without scopes when auth token does not have READ scope', async () => {
            (hasReadRoleScope as jest.Mock).mockImplementationOnce(
                (req: Request, res: Response, next: NextFunction) => {
                    res.locals.authToken = {
                        containsScopes: jest.fn().mockReturnValue(false),
                    };
                    next();
                },
            );
            const roleMockArray = [
                {_id: '789', name: 'Guest', description: 'Guest role', createdAt: '2024-12-22', scopes: ['G']},
            ];
            (Role.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValueOnce(roleMockArray),
                }),
            });
            const res = await request(app)
                .get(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken('otherUserId'));
            expect(res.status).toBe(200);
            expect(res.body).toEqual([
                {id: '789', name: 'Guest', description: 'Guest role', createdAt: '2024-12-22', scopes: []},
            ]);
        });

        it('should return 200 and an empty array when no roles exist', async () => {
            (Role.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValueOnce([]),
                }),
            });
            const res = await request(app)
                .get(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken());
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });
    });

    describe('Error', () => {
        it('should return 500 when a database error occurs', async () => {
            (Role.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockRejectedValueOnce(new Error('DB error')),
                }),
            });
            const res = await request(app)
                .get(endpoint)
                .set('Authorization', 'Bearer ' + createTestAdminToken());
            expect(res.status).toBe(500);
        });
    });

    describe('Middleware', () => {
        it('should call hasXsrfTokenMiddleware', async () => {
            await request(app).get(endpoint).set('Authorization', 'Bearer ' + createTestAdminToken());
            expect(hasXsrfTokenMiddleware).toHaveBeenCalled();
        });

        it('should call isActiveMiddleware', async () => {
            await request(app).get(endpoint).set('Authorization', 'Bearer ' + createTestAdminToken());
            expect(isActiveMiddleware).toHaveBeenCalled();
        });

        it('should call hasReadRoleScope', async () => {
            await request(app).get(endpoint).set('Authorization', 'Bearer ' + createTestAdminToken());
            expect(hasReadRoleScope).toHaveBeenCalled();
        });
    });
});
