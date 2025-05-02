import express, {Request, Response, NextFunction} from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import {logRequest} from "./middlewares/log/log.ts";
import {logError} from "./middlewares/log/Logger.ts";
import {hasJwtMiddleware} from "./middlewares/hasJwt.ts";

import {router as authenticationRouter} from "./routes/user/authentication.ts";
import {router as userRouter} from "./routes/user/user.ts";
import {router as userModificationRouter} from "./routes/user/modification.ts";
import {router as confirmationRouter} from "./routes/user/confirmation.ts";
import {router as adminRouter} from "./routes/admin/admin.ts";
import {router as systemRouter} from "./routes/system.ts";
import {hasModificationToken} from "./middlewares/hasModificationToken.ts";
import NotFoundError from "../errors/NotFoundError.ts";
import {hasXsrfTokenMiddleware} from "./middlewares/hasXsrfTokenMiddleware.ts";
import {isActiveMiddleware} from "./middlewares/isActive.ts";
import {ServerConfig} from "../models/util/ServerConfig.ts";
import HttpError from "../errors/HttpError.ts";

const app = express();

const serverConfig = ServerConfig.init();
const originRegex = `^(http:\\/\\/|https:\\/\\/)${serverConfig.domain}(?::\\d{1,5})?$`;
app.use(cors({
    origin: new RegExp(originRegex),
    credentials: true
}));

app.use(logRequest)
app.use(logger('combined'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

//routes
app.use("/authentication", hasXsrfTokenMiddleware, authenticationRouter)
app.use("/user", hasJwtMiddleware, isActiveMiddleware, hasXsrfTokenMiddleware, userRouter);
app.use("/modification", hasModificationToken, userModificationRouter)
app.use("/confirm", confirmationRouter)
app.use("/admin", hasJwtMiddleware, isActiveMiddleware, hasXsrfTokenMiddleware, adminRouter)
app.use("/system", systemRouter)

// catch route not found
app.use(function (req, res, next) {
    next(new NotFoundError());
});

// error handler
app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    if(err instanceof Error) {
        logError(err.stack)
    }

    let status = 500;
    if(err instanceof HttpError){
        status = err.status;
    }

    res.status(status).json({ message: err.message });
});

export {
    app
}