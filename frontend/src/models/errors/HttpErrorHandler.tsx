import BadRequestError from "./BadRequestError.ts";
import {ForbiddenError} from "./ForbiddenError.tsx";
import NotFoundError from "./NotFoundError.ts";
import ConflictError from "./ConflictError.ts";
import GoneError from "./GoneError.ts";
import FailedDependencyError from "./FailedDependencyError.ts";
import {HttpError} from "./HttpError.tsx";
import InternalServerError from "./InternalServerError.ts";
import ServiceUnavailableError from "./ServiceUnavailableError.ts";
import {JSX} from "react";
import {CloseCircleOutlined, QuestionCircleOutlined} from "@ant-design/icons";
import {RiUserForbidFill} from "react-icons/ri";
import UnauthorizedError from "./UnauthorizedError.ts";

export class HttpErrorHandler {

    static getErrorByStatusCode(status: number): HttpError {
        switch (status) {
            case 401: return new UnauthorizedError();
            case 400: return new BadRequestError();
            case 403: return new ForbiddenError();
            case 404: return new NotFoundError();
            case 409: return new ConflictError();
            case 410: return new GoneError();
            case 424: return new FailedDependencyError();
            case 500: return new InternalServerError();
            case 503: return new ServiceUnavailableError();
        }

        return new InternalServerError();
    }

    static getErrorIcon(status: number): JSX.Element {
        switch (status) {
            case 403: return <RiUserForbidFill style={{fontSize: '72px', color: "#ff4d4f"}}/>
            case 404: return <QuestionCircleOutlined />
        }

        return <CloseCircleOutlined style={{color: "#ff4d4f"}}/>
    }
}

