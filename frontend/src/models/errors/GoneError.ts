import {HttpError} from "./HttpError.tsx";

export default class GoneError extends HttpError {

    constructor() {
        super("Gone", 410, "The page or resource you're trying to access is no longer available. It may have been removed permanently.");
    }
}