import {HttpError} from "./HttpError.tsx";

export default class NotFoundError extends HttpError {

    constructor() {
        // @ts-ignore
        super("Not found", 404, "The page you're looking for can't be found. It might have been moved or no longer exists.");
    }
}