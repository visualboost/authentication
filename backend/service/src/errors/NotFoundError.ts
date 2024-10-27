import HttpError from "./HttpError.ts";

export default class NotFoundError extends HttpError {

    constructor() {
        super(404, "Not found");
    }
}