import request from 'supertest';
import express from 'express';
import {router} from "../../../src/server/routes/system.ts";
import {Settings} from "../../../src/models/db/Settings.ts";

jest.mock('../../../src/models/db/Settings'); // Mock Settings

const app = express();
app.use(express.json());
app.use(router);

describe('GET /enableRegistrationView', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Säubere alle Mocks nach jedem Test
    });

    it('should return enableRegistrationView as true when settings allow it', async () => {
        //@ts-ignore
        (Settings.load as jest.Mock).mockResolvedValue({
            enableRegistrationView: true,
        });

        const response = await request(app).get('/enableRegistrationView');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            enableRegistrationView: true,
        });
    });

    it('should return enableRegistrationView as false when settings disable it', async () => {
        //@ts-ignore
        (Settings.load as jest.Mock).mockResolvedValue({
            enableRegistrationView: false,
        });

        const response = await request(app).get('/enableRegistrationView');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            enableRegistrationView: false,
        });
    });

    it('should return 500 when there is an error loading settings', async () => {
        //@ts-ignore
        (Settings.load as jest.Mock).mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/enableRegistrationView');
        expect(response.statusCode).toBe(500);
    });
});
