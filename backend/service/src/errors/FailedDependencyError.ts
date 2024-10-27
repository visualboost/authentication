import HttpError from "./HttpError.ts";

export default class FailedDependencyError extends HttpError {

    constructor() {
        super(424, "Failed Dependency");
    }
}