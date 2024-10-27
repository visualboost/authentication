import {HttpError} from "./HttpError.tsx";

export default class FailedDependencyError extends HttpError {

    constructor() {
        super("Failed Dependency", 424, "Something went wrong because a required action or service failed. Please try again or contact support for assistance.");
    }
}