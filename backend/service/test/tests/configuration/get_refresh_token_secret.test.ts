import fs from 'fs';
import * as EncryptionUtil from "../../../src/util/EncryptionUtil.ts";

describe('getRefreshTokenSecret', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        process.env = {};
    });

    test('should return the refresh token secret from environment variable in development mode', () => {
        process.env.ENVIRONMENT = 'DEVELOPMENT';
        process.env.REFRESH_TOKEN_SECRET = 'myDevelopmentSecret';

        const secret = EncryptionUtil.getRefreshTokenSecret();

        expect(secret).toBe('myDevelopmentSecret');
    });

    test('should read the refresh token secret from Docker secret in production mode', () => {
        process.env.ENVIRONMENT = 'PRODUCTION';

        const existSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        const readFileSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('myProductionSecret')

        const secret = EncryptionUtil.getRefreshTokenSecret();

        expect(secret).toBe('myProductionSecret');
        expect(readFileSpy).toHaveBeenCalledWith('/run/secrets/refresh_token_secret', 'utf8');
    });

    test('should throw an error if refresh token secret is missing in development mode', () => {
        process.env.ENVIRONMENT = 'DEVELOPMENT';
        process.env.REFRESH_TOKEN_SECRET = ''; // No secret set

        expect(() => EncryptionUtil.getRefreshTokenSecret()).toThrow('Missing refresh token');
    });

    test('should throw an error if Docker secret is missing in production mode', () => {
        process.env.ENVIRONMENT = 'PRODUCTION';

        jest.spyOn(EncryptionUtil, 'getDockerSecret').mockReturnValue(null);
        expect(() => EncryptionUtil.getRefreshTokenSecret()).toThrow('Missing refresh token');
    });
});
