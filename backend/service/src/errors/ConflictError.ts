import HttpError from "./HttpError.ts";

export default class ConflictError extends HttpError {

    constructor() {
        super(409, "Conflict");
    }
}