import HttpError from "./HttpError.ts";

export default class GoneError extends HttpError {

    constructor() {
        super(410, "Gone");
    }
}