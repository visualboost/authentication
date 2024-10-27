import {HttpError} from "./HttpError.tsx";

export class ForbiddenError extends HttpError {

    constructor() {
        super("Forbidden", 403, "Sorry, you don't have permission to access this page or perform this action.");
    }


}