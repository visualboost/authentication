import {Settings} from "../../../src/models/db/Settings.ts";
import express from "express";
import {router} from "../../../src/server/routes/system.ts";
import request from "supertest";

jest.mock('../../../src/models/db/Settings.ts');

const app = express();
app.use(express.json());
app.use(router);

describe('GET /privacypolicy', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Säubere alle Mocks nach jedem Test
    });

    it('should return the privacy policy when it is available', async () => {
        //@ts-ignore
        Settings.load.mockResolvedValue({
            showPrivacyPolicy: true,
            privacyPolicyUrl: 'https://example.com/privacy',
        });

        const response = await request(app).get('/privacypolicy');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            showPrivacyPolicy: true,
            privacyPolicyUrl: 'https://example.com/privacy',
        });
    });

    it('should throw NotFoundError when privacy policy is enabled but URL is missing', async () => {
        //@ts-ignore
        Settings.load.mockResolvedValue({
            showPrivacyPolicy: true,
            privacyPolicyUrl: '',
        });

        const response = await request(app).get('/privacypolicy');

        expect(response.statusCode).toBe(404);
    });

    it('should return the correct response when privacy policy is disabled', async () => {
        //@ts-ignore
        Settings.load.mockResolvedValue({
            showPrivacyPolicy: false,
            privacyPolicyUrl: null,
        });

        const response = await request(app).get('/privacypolicy');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            showPrivacyPolicy: false,
            privacyPolicyUrl: null,
        });
    });

    it('should handle errors and call the error handler', async () => {
        //@ts-ignore
        Settings.load.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/privacypolicy');

        expect(response.statusCode).toBe(500);
    });
});