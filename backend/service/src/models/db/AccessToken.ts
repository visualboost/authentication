import mongoose, {Model,ObjectId} from "mongoose";
import {UserState} from "../../constants/UserState.ts";

const Schema = mongoose.Schema;

export interface IAccessToken extends Document {
    name: string;
    userId: ObjectId;
    userState: number;
    userRole: string;
    expiresIn: Date;
    scopes: string[];
}

export interface IAccessTokenModel extends Model<IAccessToken> {}

const AccessTokenSchema = new Schema<IAccessToken, IAccessTokenModel>({
    name: {type: String, required: true, unique: true},
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true, indexed: true},
    userState: {type: Number, required: true},
    userRole: {type: String, required: true},
    expiresIn: {type: Date, required: true},
    scopes: [{type: String}]
}, {timestamps: true});


const AccessToken = mongoose.model<IAccessToken, IAccessTokenModel>('AccessToken', AccessTokenSchema);

export {
    AccessToken
}
