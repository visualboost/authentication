
import {getDockerSecret} from "../../../src/util/EncryptionUtil.ts";
import {MailConfig} from "../../../src/models/util/MailConfig.ts";

jest.mock('../../../src/util/EncryptionUtil.ts', () => ({
    getDockerSecret: jest.fn()
}));

describe('MailConfig', () => {

    describe('init', () => {
        it('should initialize from environment when in DEVELOPMENT environment', () => {
            // Set environment variables
            process.env.ENVIRONMENT = 'DEVELOPMENT';
            process.env.MAIL_HOST = 'smtp.example.com';
            process.env.MAIL_PORT = '587';
            process.env.MAIL_USER = 'testuser';
            process.env.MAIL_PW = 'testpassword';

            const config = MailConfig.init();

            // Assertions
            expect(config.host).toBe('smtp.example.com');
            expect(config.port).toBe(587);
            expect(config.user).toBe('testuser');
            expect(config.password).toBe('testpassword');
        });

        it('should initialize from secrets when not in DEVELOPMENT environment', () => {
            // Mock getDockerSecret return value
            (getDockerSecret as jest.Mock).mockReturnValue(`
                MAIL_HOST=smtp.secret.com
                MAIL_PORT=465
                MAIL_USER=secretuser
                MAIL_PW=secretpassword
            `);
            process.env.ENVIRONMENT = 'PRODUCTION';

            const config = MailConfig.init();

            // Assertions
            expect(config.host).toBe('smtp.secret.com');
            expect(config.port).toBe(465);
            expect(config.user).toBe('secretuser');
            expect(config.password).toBe('secretpassword');
        });
    });

    describe('initFromEnvironment', () => {
        it('should initialize MailConfig from environment variables', () => {
            // Set environment variables
            process.env.MAIL_HOST = 'smtp.example.com';
            process.env.MAIL_PORT = '587';
            process.env.MAIL_USER = 'testuser';
            process.env.MAIL_PW = 'testpassword';

            const config = MailConfig.initFromEnvironment();

            // Assertions
            expect(config.host).toBe('smtp.example.com');
            expect(config.port).toBe(587);
            expect(config.user).toBe('testuser');
            expect(config.password).toBe('testpassword');
        });
    });

    describe('initFromSecrets', () => {
        it('should initialize MailConfig from Docker secrets', () => {
            // Mock getDockerSecret return value
            (getDockerSecret as jest.Mock).mockReturnValue(`
                MAIL_HOST=smtp.secret.com
                MAIL_PORT=465
                MAIL_USER=secretuser
                MAIL_PW=secretpassword
            `);

            const config = MailConfig.initFromSecrets();

            // Assertions
            expect(config.host).toBe('smtp.secret.com');
            expect(config.port).toBe(465);
            expect(config.user).toBe('secretuser');
            expect(config.password).toBe('secretpassword');
        });

        it('should handle missing or incomplete secret values gracefully', () => {
            // Mock getDockerSecret with incomplete values
            (getDockerSecret as jest.Mock).mockReturnValue(`
                MAIL_HOST=
                MAIL_PORT=465
                MAIL_USER=
                MAIL_PW=
            `);

            const config = MailConfig.initFromSecrets();

            // Assertions
            expect(config.host).toBe('');
            expect(config.port).toBe(465);
            expect(config.user).toBe('');
            expect(config.password).toBe('');
        });
    });
});
