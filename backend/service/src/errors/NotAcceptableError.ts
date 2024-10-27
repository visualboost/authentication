import HttpError from "./HttpError.ts";

export default class NotAcceptableError extends HttpError {

    constructor() {
        super(406, "Not Acceptable");
    }
}