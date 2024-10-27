import {NextFunction, Request, Response} from "express";
import ForbiddenError from "../../errors/ForbiddenError.ts";
import {UserModification} from "../../models/db/UserModification.ts";
import {getAsset} from "../../util/FileHandler.ts";

const hasModificationToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.query.token as string;
    if (!token) {
        throw new ForbiddenError();
    }

    const userModificationDoc = await UserModification.findByToken(token);
    if (!userModificationDoc) {
        throw new ForbiddenError()
    }

    if (!userModificationDoc || userModificationDoc.isExpired() === true) {
        const asset = await getAsset("modification_expired.html")
        return res.send(asset)
    }

    res.locals.modificationDoc = userModificationDoc;
    res.locals.modificationToken = token;
    next();
};

export {
    hasModificationToken
}
