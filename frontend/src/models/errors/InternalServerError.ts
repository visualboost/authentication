import {HttpError} from "./HttpError.tsx";

export default class InternalServerError extends HttpError {

    constructor() {
        super("Internal Server Error", 500, "Something went wrong on our end. We're working to fix it as soon as possible.");
    }
}