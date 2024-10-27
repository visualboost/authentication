import fs from 'fs';
import { getDockerSecret } from '../../../src/util/EncryptionUtil';

describe('getDockerSecret', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('should return the secret content if the file exists', () => {
        const secretName = 'my_secret';
        const mockSecretValue = 'mockSecretValue';

        const existSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        const readFileSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue(mockSecretValue)

        // (fs.existsSync as jest.Mock).mockReturnValue(true);
        // (fs.readFileSync as jest.Mock).mockReturnValue(mockSecretValue);

        const secret = getDockerSecret(secretName);

        expect(secret).toBe(mockSecretValue);
        expect(existSyncSpy).toHaveBeenCalledWith(`/run/secrets/${secretName}`);
        expect(readFileSpy).toHaveBeenCalledWith(`/run/secrets/${secretName}`, 'utf8');
    });

    test('should return null if the file does not exist', () => {
        // Arrange
        const secretName = 'non_existent_secret';

        const existSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        const readFileSpy = jest.spyOn(fs, 'readFileSync')

        const secret = getDockerSecret(secretName);

        expect(secret).toBeNull();
        expect(existSyncSpy).toHaveBeenCalledWith(`/run/secrets/${secretName}`);
        expect(readFileSpy).not.toHaveBeenCalled();
    });

    test('should throw an error if reading the file fails', () => {
        const secretName = 'my_secret';

        const existSyncSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        const readFileSpy = jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
            throw new Error('File read error');
        })

        expect(() => getDockerSecret(secretName)).toThrow('File read error');
        expect(existSyncSpy).toHaveBeenCalledWith(`/run/secrets/${secretName}`);
        expect(readFileSpy).toHaveBeenCalledWith(`/run/secrets/${secretName}`, 'utf8');
    });
});
