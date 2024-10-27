import fs from 'fs';
import * as EncryptionUtil from '../../../src/util/EncryptionUtil';

describe('getEncryptionKey', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        process.env = {};
    });

    test('should return the encryption key and iv from environment variable in development mode', () => {
        process.env.ENVIRONMENT = 'DEVELOPMENT';
        process.env.DEV_ENCRYPTION_KEY = '32ByteDevEncryptionKeyString_16ByteDevIvString';

        const encryptionKey = EncryptionUtil.getEncryptionKey();

        expect(encryptionKey).toEqual({
            key: '32ByteDevEncryptionKeyString',
            iv: '16ByteDevIvString',
        });
    });

    test('should read the encryption key and iv from Docker secret in production mode', () => {
        process.env.ENVIRONMENT = 'PRODUCTION';

        const existSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        const readFileSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('32ByteProdEncryptionKeyString_16ByteProdIvString')

        const encryptionKey = EncryptionUtil.getEncryptionKey();

        expect(encryptionKey).toEqual({
            key: '32ByteProdEncryptionKeyString',
            iv: '16ByteProdIvString',
        });
        expect(readFileSpy).toHaveBeenCalledWith('/run/secrets/encryption_key', 'utf8');
    });

    test('should throw an error if encryption key is missing in development mode', () => {
        process.env.ENVIRONMENT = 'DEVELOPMENT';
        process.env.DEV_ENCRYPTION_KEY = ''; // Kein Key gesetzt

        expect(() => EncryptionUtil.getEncryptionKey()).toThrow('Missing encryption key');
    });

    test('should throw an error if Docker secret is missing in production mode', () => {
        process.env.ENVIRONMENT = 'PRODUCTION';

        const existSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        const readFileSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('')

        expect(() => EncryptionUtil.getEncryptionKey()).toThrow('Missing encryption key');
        expect(readFileSpy).toHaveBeenCalledWith('/run/secrets/encryption_key', 'utf8');
    });

    test('should throw an error if the format of the encryption key is incorrect', () => {
        process.env.ENVIRONMENT = 'DEVELOPMENT';
        process.env.DEV_ENCRYPTION_KEY = 'InvalidFormatKey'; // Ungültiges Format

        expect(() => EncryptionUtil.getEncryptionKey()).toThrow('Missing encryption key');
    });
});
