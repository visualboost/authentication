import {HttpError} from "./HttpError.tsx";

export default class BadRequestError extends HttpError {

    constructor() {
        super("Bad Request", 400, "Oops! It looks like there was a problem with the information you provided. Please check your input and try again.");
    }
}