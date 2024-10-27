export class HttpError extends Error {

    status: number;
    description: string;

    constructor(message: string, status: number, description: string) {
        super(message);
        this.status = status;
        this.description = description;
    }
}

