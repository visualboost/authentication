import request from 'supertest';
import {Request, Response, NextFunction} from 'express';
import {User} from "../../../src/models/db/User.ts";
import {MailHandler} from "../../../src/util/MailHandler.ts";
import {app} from "../../../src/server/server.ts";
import {Success} from "../../../src/models/api/Success.ts";
import {JwtHandler} from "../../../src/util/JwtHandler.ts";
import {SystemRoles} from "../../../src/constants/SystemRoles.ts";
import {UserState} from "../../../src/constants/UserState.ts";
import {hasXsrfTokenMiddleware} from "../../../src/server/middlewares/hasXsrfTokenMiddleware.ts";
import {isBlacklistedMiddleware} from "../../../src/server/middlewares/isBlacklisted.ts";

jest.mock('../../../src/models/db/User.ts');
jest.mock('../../../src/util/MailHandler.ts');

jest.mock('../../../src/server/middlewares/isBlacklisted.ts', () => ({
    isBlacklistedMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

jest.mock('../../../src/server/middlewares/log/log.ts', () => ({
    logRequest: jest.fn((req: Request, res: Response, next: NextFunction) => {
        res.locals.ip = '127.0.0.1';
        next();
    }),
}));

jest.mock('../../../src/server/middlewares/hasXsrfTokenMiddleware.ts', () => ({
    hasXsrfTokenMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
        next();
    }),
}));

const mockedUser = User as jest.Mocked<typeof User>;
const mockedMailHandler = MailHandler as jest.Mocked<typeof MailHandler>;

describe('POST /authentication/registration/admin', () => {
    const endpoint = '/authentication/registration/admin';
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully register a new admin and return Success message', async () => {
        const mockAdmin = {
            _id: 'admin-id',
            userName: 'adminUser',
            updateLastLogin: jest.fn().mockResolvedValue(undefined),
            getRefreshToken: jest.fn()
        };

        //@ts-ignore
        mockedUser.adminExists.mockResolvedValue(false);
        //@ts-ignore
        mockedUser.createAdmin.mockResolvedValue(mockAdmin as any);
        mockedMailHandler.sendRegistrationMail.mockResolvedValue(undefined);

        const requestBody = {
            username: 'adminUser',
            email: 'admin@example.com',
            password: 'securePassword123',
        };

        // Act
        const response = await request(app)
            .post(endpoint)
            .send(requestBody);

        // Assert
        expect(response.status).toBe(201);
        expect(response.body).toEqual(new Success());
        //@ts-ignore
        expect(mockedUser.adminExists).toHaveBeenCalledTimes(1);
        //@ts-ignore
        expect(mockedUser.createAdmin).toHaveBeenCalledWith(
            requestBody.username,
            requestBody.email,
            requestBody.password
        );
        expect(mockAdmin.updateLastLogin).toHaveBeenCalledWith('127.0.0.1'); // res.locals.ip ist nicht gesetzt
        expect(mockedMailHandler.sendRegistrationMail).toHaveBeenCalledWith(
            requestBody.email,
            mockAdmin._id,
            mockAdmin.userName
        );
        expect(mockAdmin.getRefreshToken).toHaveBeenCalledTimes(1);
    });

    it('should return 400 Bad Request if required fields are missing', async () => {
        // Arrange
        const requestBody = {
            username: 'adminUser',
            password: 'securePassword123',
        };

        // Act
        const response = await request(app)
            .post(endpoint)
            .send(requestBody);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body).toEqual({message: 'Bad Request'});
        //@ts-ignore
        expect(mockedUser.adminExists).not.toHaveBeenCalled();
        //@ts-ignore
        expect(mockedUser.createAdmin).not.toHaveBeenCalled();
        expect(mockedMailHandler.sendRegistrationMail).not.toHaveBeenCalled();
    });

    it('should return 409 Conflict if admin already exists', async () => {
        //@ts-ignore
        mockedUser.adminExists.mockResolvedValue(true);

        const requestBody = {
            username: 'adminUser',
            email: 'admin@example.com',
            password: 'securePassword123',
        };

        // Act
        const response = await request(app)
            .post(endpoint)
            .send(requestBody);

        // Assert
        expect(response.status).toBe(409);
        expect(response.body).toEqual({message: 'Conflict'});
        //@ts-ignore
        expect(mockedUser.adminExists).toHaveBeenCalledTimes(1);
        //@ts-ignore
        expect(mockedUser.createAdmin).not.toHaveBeenCalled();
        expect(mockedMailHandler.sendRegistrationMail).not.toHaveBeenCalled();
    });

    it('should return 500 if User.createAdmin throws an error', async () => {
        //@ts-ignore
        mockedUser.adminExists.mockResolvedValue(false);
        //@ts-ignore
        mockedUser.createAdmin.mockRejectedValue(new Error('Database error'));

        const requestBody = {
            username: 'adminUser',
            email: 'admin@example.com',
            password: 'securePassword123',
        };

        // Act
        const response = await request(app)
            .post(endpoint)
            .send(requestBody);

        // Assert
        expect(response.status).toBe(500);
        expect(response.body).toEqual({message: 'Database error'});
        //@ts-ignore
        expect(mockedUser.adminExists).toHaveBeenCalledTimes(1);
        //@ts-ignore
        expect(mockedUser.createAdmin).toHaveBeenCalledTimes(1);
        expect(mockedMailHandler.sendRegistrationMail).not.toHaveBeenCalled();
    });

    it('should return 500 Internal Server Error if MailHandler.sendRegistrationMail throws an error', async () => {
        // Arrange
        const mockJwt = 'mocked-jwt-token';
        const mockAdmin = {
            _id: 'admin-id',
            userName: 'adminUser',
            updateLastLogin: jest.fn().mockResolvedValue(undefined),
        };

        //@ts-ignore
        mockedUser.adminExists.mockResolvedValue(false);
        //@ts-ignore
        mockedUser.createAdmin.mockResolvedValue(mockAdmin as any);
        mockedMailHandler.sendRegistrationMail.mockRejectedValue(new Error('Mail service error'));

        const requestBody = {
            username: 'adminUser',
            email: 'admin@example.com',
            password: 'securePassword123',
        };

        // Act
        const response = await request(app)
            .post(endpoint)
            .send(requestBody);

        // Assert
        expect(response.status).toBe(500);
        expect(response.body).toEqual({message: 'Mail service error'});
        //@ts-ignore
        expect(mockedUser.adminExists).toHaveBeenCalledTimes(1);
        //@ts-ignore
        expect(mockedUser.createAdmin).toHaveBeenCalledTimes(1);
        expect(mockedMailHandler.sendRegistrationMail).toHaveBeenCalledTimes(1);
    });

    it('should set res.locals.ip before updating last login', async () => {
        jest.spyOn(JwtHandler, 'setRefreshTokenCookie').mockReturnValue();

        // Arrange
        const mockJwt = 'mocked-jwt-token';
        const mockAdmin = {
            _id: 'admin-id',
            userName: 'adminUser',
            updateLastLogin: jest.fn().mockResolvedValue(undefined),
            getRefreshToken: jest.fn().mockReturnValueOnce("refresh-token"),
        };

        //@ts-ignore
        mockedUser.adminExists.mockResolvedValue(false);
        //@ts-ignore
        mockedUser.createAdmin.mockResolvedValue(mockAdmin as any);
        mockedMailHandler.sendRegistrationMail.mockResolvedValue(undefined);

        const requestBody = {
            username: 'adminUser',
            email: 'admin@example.com',
            password: 'securePassword123',
        };

        const response = await request(app)
            .post(endpoint)
            .set('Authorization', 'Bearer ' + JwtHandler.createAuthToken("userId123", SystemRoles.USER, UserState.ACTIVE))
            .send(requestBody);

        // Assert
        expect(response.status).toBe(201);
        expect(mockAdmin.updateLastLogin).toHaveBeenCalledWith('127.0.0.1');
    });

    describe('Middleware Tests', () => {

        it('should call isBlacklistedMiddleware', async () => {
            await request(app).post(endpoint);
            expect(isBlacklistedMiddleware).toHaveBeenCalled();
        });

        it('should call hasXsrfTokenMiddleware', async () => {
            const res = await request(app)
                .post(endpoint)
                .set('Authorization', 'Bearer ' + JwtHandler.createAuthToken("userId123", SystemRoles.USER, UserState.ACTIVE))
            expect(hasXsrfTokenMiddleware).toHaveBeenCalled();
        });

    });
});
