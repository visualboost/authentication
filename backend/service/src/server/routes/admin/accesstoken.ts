import express from "express";
import {JwtContent} from "../../../models/api/JwtContent.ts";
import {hasReadAccessTokenScope, hasWriteAccessTokenScope} from "../../middlewares/scope/hasApiScopesMiddleware.ts";
import {JwtHandler} from "../../../util/JwtHandler.ts";
import {AccessToken} from "../../../models/db/AccessToken.ts";
import ms, {StringValue} from 'ms';
import BadRequestError from "../../../errors/BadRequestError.ts";

const router = express.Router();

router.post(
    '',
    hasWriteAccessTokenScope,
    async (req, res, next) => {
        try {
            const name = req.body.name as string;
            const scopes = req.body.scopes as string[];
            const expiresIn = req.body.expiresIn as StringValue;

            const accessToken = res.locals.authToken as JwtContent;
            const userId = accessToken.getUserId();
            const userState = accessToken.getState();
            const userRole = accessToken.getRole();

            const expiresInString = ms(expiresIn);

            const newAccessToken = new AccessToken({
                name: name,
                userId: userId,
                userState: userState,
                userRole: userRole,
                scopes: scopes,
                expiresIn: new Date(Date.now() + expiresInString)
            })

            await newAccessToken.save();
            const personalAccessToken = JwtHandler.createPersonalAccessToken(newAccessToken._id.toString(), expiresIn);

            return res.json({
                accessToken: personalAccessToken
            });
        } catch (e) {
            next(e);
        }
    }
);

router.get(
    '',
    hasReadAccessTokenScope,
    async (req, res, next) => {
        try {
            const userId = req.query.userId as string;
            if(!userId){
                throw new BadRequestError();
            }

            const accessTokens = await AccessToken.find({userId: userId}, {_id: 1, name: 1, expiresIn: 1, scopes: 1}).lean();
            return res.json(accessTokens);
        } catch (e) {
            next(e);
        }
    }
);

router.delete(
    '/:_id',
    hasWriteAccessTokenScope,
    async (req, res, next) => {
        try {
            const _id = req.params._id as string;

            if(!_id){
                throw new BadRequestError();
            }

            const accessToken = await AccessToken.findOneAndDelete({_id: _id}, {_id: 1, name: 1, expiresIn: 1, scopes: 1}).lean();
            return res.json(accessToken);
        } catch (e) {
            next(e);
        }
    }
);

router.put(
    '/:_id',
    hasWriteAccessTokenScope,
    async (req, res, next) => {
        try {
            const _id = req.params._id as string;
            const expiresIn = req.params.userId as StringValue;

            if(!_id){
                throw new BadRequestError();
            }

            const expiresInString = ms(expiresIn);
            const accessToken = await AccessToken.findOneAndUpdate({_id: _id}, {expiresIn: new Date(Date.now() + expiresInString)}, {_id: 1, name: 1, expiresIn: 1, scopes: 1}).lean();
            return res.json(accessToken);
        } catch (e) {
            next(e);
        }
    }
);


export {
    router
}