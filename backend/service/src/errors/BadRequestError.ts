import HttpError from "./HttpError.ts";

export default class BadRequestError extends HttpError {

    constructor() {
        super(400, "Bad Request");
    }
}