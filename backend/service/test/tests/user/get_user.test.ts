import request from 'supertest';
import {app} from '../../../src/server/server';
import {User} from '../../../src/models/db/User';
import ForbiddenError from '../../../src/errors/ForbiddenError';
import NotFoundError from '../../../src/errors/NotFoundError';
import {isActiveMiddleware} from "../../../src/server/middlewares/isActive.ts";
import {hasJwtMiddleware} from '../../../src/server/middlewares/hasJwt';
import {hasXsrfTokenMiddleware} from '../../../src/server/middlewares/hasXsrfTokenMiddleware';
import {createDefaultRoleToken} from '../../util/JwtUtil';
import {NextFunction, Request, Response} from 'express';
import {JwtHandler} from "../../../src/util/JwtHandler.ts";

jest.mock('../../../src/models/db/User');

jest.mock('../../../src/server/middlewares/hasJwt.ts', () => ({
    hasJwtMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        res.locals.authToken = JwtHandler.fromRequest(req)
        next();
    }),
}));

jest.mock('../../../src/server/middlewares/isActive.ts', () => ({
    isActiveMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

jest.mock('../../../src/server/middlewares/hasXsrfTokenMiddleware.ts', () => ({
    hasXsrfTokenMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

describe(`GET /user/:userId`, () => {
    const endpoint = "/user"

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {

        it('should return 200 and user details if paramId equals the current userId', async () => {
            const userId = '123';
            const userDetailsMock = {id: userId, name: 'John Doe'};

            (hasJwtMiddleware as jest.Mock).mockImplementationOnce(
                (req: Request, res: Response, next: NextFunction) => {
                    res.locals.authToken = {
                        getUserId: jest.fn().mockReturnValue(userId),
                        containsScopes: jest.fn().mockReturnValue(false),
                    };
                    next();
                },
            );
            (User.getDetails as jest.Mock).mockResolvedValueOnce(userDetailsMock);

            const res = await request(app)
                .get(`${endpoint}/${userId}`)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken(userId));

            expect(res.status).toBe(200);
            expect(res.body).toEqual(userDetailsMock);
            expect(User.getDetails).toHaveBeenCalledWith(userId);
        });

        it('should return 200 and user details if paramId differs from userId but has Scope.User.READ', async () => {
            // Arrange
            const currentUserId = '123';
            const paramId = '456';
            const userDetailsMock = {id: paramId, name: 'Jane Doe'};

            (hasJwtMiddleware as jest.Mock).mockImplementationOnce(
                (req: Request, res: Response, next: NextFunction) => {
                    res.locals.authToken = {
                        getUserId: jest.fn().mockReturnValue(currentUserId),
                        containsScopes: jest.fn().mockReturnValue(true),
                    };
                    next();
                },
            );
            (User.getDetails as jest.Mock).mockResolvedValueOnce(userDetailsMock);

            const res = await request(app)
                .get(`${endpoint}/${paramId}`)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken(currentUserId));

            expect(res.status).toBe(200);
            expect(res.body).toEqual(userDetailsMock);
            expect(User.getDetails).toHaveBeenCalledWith(paramId);
        });
    });

    describe('Error', () => {
        it('should return 403 (ForbiddenError) if paramId != userId and missing Scope.User.READ', async () => {
            // Arrange
            const currentUserId = '123';
            const paramId = '456';

            (hasJwtMiddleware as jest.Mock).mockImplementationOnce(
                (req: Request, res: Response, next: NextFunction) => {
                    res.locals.authToken = {
                        getUserId: jest.fn().mockReturnValue(currentUserId),
                        containsScopes: jest.fn().mockReturnValue(false),
                    };
                    next();
                },
            );

            // Act
            const res = await request(app)
                .get(`${endpoint}/${paramId}`)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken(currentUserId));

            // Assert
            expect(res.status).toBe(new ForbiddenError().status);
            expect(res.body).toEqual({message: new ForbiddenError().message});
        });

        it('should return 404 (NotFoundError) if the user does not exist', async () => {
            const userId = '123';
            (hasJwtMiddleware as jest.Mock).mockImplementationOnce(
                (req: Request, res: Response, next: NextFunction) => {
                    res.locals.authToken = {
                        getUserId: jest.fn().mockReturnValue(userId),
                        containsScopes: jest.fn().mockReturnValue(false),
                    };
                    next();
                },
            );
            (User.getDetails as jest.Mock).mockResolvedValueOnce(null);

            const res = await request(app)
                .get(`${endpoint}/${userId}`)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken(userId));

            expect(res.status).toBe(new NotFoundError().status);
            expect(res.body).toEqual({message: new NotFoundError().message});
        });

        it('should return 500 if an unexpected error occurs', async () => {
            const userId = '123';
            (hasJwtMiddleware as jest.Mock).mockImplementationOnce(
                (req: Request, res: Response, next: NextFunction) => {
                    res.locals.authToken = {
                        getUserId: jest.fn().mockReturnValue(userId),
                        containsScopes: jest.fn().mockReturnValue(false),
                    };
                    next();
                },
            );
            (User.getDetails as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            const res = await request(app)
                .get(`${endpoint}/${userId}`)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken(userId));

            expect(res.status).toBe(500);
        });
    });

    describe('Middleware Tests', () => {
        it('should call hasJwtMiddleware', async () => {
            await request(app).get(`${endpoint}/123`);
            expect(hasJwtMiddleware).toHaveBeenCalled();
        });

        it('should call isActiveMiddleware', async () => {
            await request(app).get(`${endpoint}/123`)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken("123"));
            expect(isActiveMiddleware).toHaveBeenCalled();
        });

        it('should call hasXsrfTokenMiddleware', async () => {
            await request(app).get(`${endpoint}/123`)
                .set('Authorization', 'Bearer ' + createDefaultRoleToken("123"));
            expect(hasXsrfTokenMiddleware).toHaveBeenCalled();
        });
    });
});
