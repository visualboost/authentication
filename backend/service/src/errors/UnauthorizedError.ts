import HttpError from "./HttpError.ts";

export default class UnauthorizedError extends HttpError {

    constructor() {
        super(401, "Unauthorized");
    }
}