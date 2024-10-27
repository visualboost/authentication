import {HttpError} from "./HttpError.tsx";

export default class ConflictError extends HttpError {

    constructor() {
        super("Conflict", 409, "There seems to be a conflict with your request. Please refresh the page or try again later.");
    }
}