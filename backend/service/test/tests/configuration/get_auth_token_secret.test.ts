import fs from 'fs';
import * as EncryptionUtil from "../../../src/util/EncryptionUtil.ts";


describe('getAuthenticationTokenSecret', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        process.env = {}; // Setze die Umgebungsvariablen vor jedem Test zurück
    });

    test('should return the authentication token secret from environment variable in development mode', () => {
        process.env.ENVIRONMENT = 'DEVELOPMENT';
        process.env.AUTH_TOKEN_SECRET = 'myDevelopmentSecret';

        const secret = EncryptionUtil.getAuthenticationTokenSecret();

        expect(secret).toBe('myDevelopmentSecret');
    });

    test('should read the authentication token secret from Docker secret in production mode', () => {
        process.env.ENVIRONMENT = 'PRODUCTION';

        const existSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        const readFileSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('myProductionSecret')

        const secret = EncryptionUtil.getAuthenticationTokenSecret();

        expect(secret).toBe('myProductionSecret');
        expect(readFileSpy).toHaveBeenCalledWith('/run/secrets/auth_token_secret', 'utf8');
    });

    test('should throw an error if authentication token secret is missing in development mode', () => {
        process.env.ENVIRONMENT = 'DEVELOPMENT';
        process.env.AUTH_TOKEN_SECRET = ''; // Kein Secret gesetzt

        expect(() => EncryptionUtil.getAuthenticationTokenSecret()).toThrow('Missing auth token');
    });

    test('should throw an error if Docker secret is missing in production mode', () => {
        process.env.ENVIRONMENT = 'PRODUCTION';

        jest.spyOn(EncryptionUtil, 'getDockerSecret').mockReturnValue(null);
        expect(() => EncryptionUtil.getAuthenticationTokenSecret()).toThrow('Missing auth token');
    });
});
