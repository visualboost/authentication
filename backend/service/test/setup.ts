import { logger } from "../src/server/middlewares/log/Logger";

beforeAll(() => {
    logger.transports.forEach(transport => {
        transport.silent = true;
    })
});

afterAll(() => {
    logger.transports.forEach(transport => {
        transport.silent = false;
    })
});