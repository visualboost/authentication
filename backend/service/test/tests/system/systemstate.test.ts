import request from 'supertest';
import express from 'express';
import {SystemStateResponse} from "../../../src/models/api/SystemState.ts";
import {User} from "../../../src/models/db/User.ts";
import {router} from "../../../src/server/routes/system.ts";

jest.mock('../../../src/models/db/User'); // Mock User
jest.mock('../../../src/models/api/SystemState'); // Mock SystemStateResponse

const app = express();
app.use(express.json());
app.use(router);

describe('GET /state', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return InitializedState when admin exists', async () => {
        //@ts-ignore
        (User.adminExists as jest.Mock).mockResolvedValue(true);
        (SystemStateResponse.InitializedState as jest.Mock).mockReturnValue({
            state: 'initialized',
            message: 'System has already been initialized',
        });

        const response = await request(app).get('/state');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            state: 'initialized',
            message: 'System has already been initialized',
        });
    });

    it('should return NotInitializedState when admin does not exist', async () => {
        //@ts-ignore
        (User.adminExists as jest.Mock).mockResolvedValue(false);
        (SystemStateResponse.NotInitializedState as jest.Mock).mockReturnValue({
            state: 'not_initialized',
            message: 'System is not initialized',
        });

        const response = await request(app).get('/state');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            state: 'not_initialized',
            message: 'System is not initialized',
        });
    });

    it('should return 500 when there is an error', async () => {
        //@ts-ignore
        (User.adminExists as jest.Mock).mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/state');
        expect(response.statusCode).toBe(500); // Der Fehler sollte zu einem 500er Status führen
    });
});
