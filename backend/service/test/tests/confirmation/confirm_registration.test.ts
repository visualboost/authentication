import request from 'supertest';
import { User } from '../../../src/models/db/User.ts';
import { Settings } from '../../../src/models/db/Settings.ts';
import { app } from '../../../src/server/server.ts';
import { ServerUtil } from '../../../src/util/ServerUtil.ts';

jest.mock('../../../src/models/db/User.ts');
jest.mock('../../../src/models/db/Settings.ts');
jest.mock('../../../src/util/ServerUtil.ts');

describe('GET /confirm/registration', () => {
    const endpoint = '/confirm/registration';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Success', () => {
        it('should return 302 and redirect to hook URL if provided', async () => {
            const mockUserId = '123';
            const mockHookUrl = 'https://example.com/redirect';

            (User.activate as jest.Mock).mockResolvedValueOnce(true);
            (Settings.getAuthenticationHook as jest.Mock).mockResolvedValueOnce({ url: mockHookUrl });

            const res = await request(app).get(endpoint).query({ userId: mockUserId });

            expect(res.status).toBe(302);  // 302 Found, indicating a redirect
            expect(res.header.location).toBe(mockHookUrl);  // Check the redirect location
        });

        it('should return 302 and redirect to default URL if no hook URL is provided', async () => {
            const mockUserId = '123';
            const mockFrontendUrl = 'https://frontend.com/registration/confirmed';

            (User.activate as jest.Mock).mockResolvedValueOnce(true);
            (Settings.getAuthenticationHook as jest.Mock).mockResolvedValueOnce(null);
            (ServerUtil.getConfirmedRegistrationUrl as jest.Mock).mockReturnValueOnce(mockFrontendUrl);
            const res = await request(app).get(endpoint).query({ userId: mockUserId });

            expect(res.status).toBe(302);
            expect(res.header.location).toBe(mockFrontendUrl);
        });
    });

    describe('Error', () => {
        it('should return 400 if userId is missing', async () => {
            const res = await request(app).get(endpoint).query({ userId: '' });

            expect(res.status).toBe(400);  // BadRequestError should return 400
        });

        it('should return 500 if User.activate throws an error', async () => {
            const mockUserId = '123';

            (User.activate as jest.Mock).mockRejectedValueOnce(new Error('Activation failed'));

            const res = await request(app).get(endpoint).query({ userId: mockUserId });

            expect(res.status).toBe(500);  // Internal server error
        });
    });
});
