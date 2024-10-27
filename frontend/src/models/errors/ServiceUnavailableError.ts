import {HttpError} from "./HttpError.tsx";

export default class ServiceUnavailableError extends HttpError {

    constructor() {
        super("Service Unavailable", 503, "The service is temporarily unavailable. Please try again later or check back soon.");
    }
}