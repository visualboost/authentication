import {HttpError} from "./HttpError.tsx";

export default class UnauthorizedError extends HttpError {

    constructor() {
        // @ts-ignore
        super("Unauthorized", 401, "");
    }
}