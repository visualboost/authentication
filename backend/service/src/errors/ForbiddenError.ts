import HttpError from "./HttpError.ts";

export default class ForbiddenError extends HttpError {

    constructor() {
        super(403, "Forbidden");
    }
}