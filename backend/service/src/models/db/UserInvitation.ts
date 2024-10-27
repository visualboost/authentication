import mongoose, {Model} from "mongoose";
import {IUser, User} from "./User.ts";
import {TimeUtil} from "../../util/TimeUtil.ts";

const Schema = mongoose.Schema;

const EXPIRES_IN_MINUTES = 10;

export interface IUserInvitation extends mongoose.Document {
    email: string;
    role: string;
    expiration: Date;
    toUser(username: string, password: string): Promise<IUser>;
    isExpired(): boolean;
}

export interface IUserInvitationModel extends Model<IUserInvitation> {
    newUserInvitation(email: string, role: string): Promise<IUserInvitation>;
}

const UserInvitationSchema = new Schema({
    email: {type: String, required: true},
    role: {type: String, required: true},
    expiration: {
        type: Date, required: true, default: function () {
            return TimeUtil.createTimeInMinutes(EXPIRES_IN_MINUTES)
        }
    },
}, {
    methods: {
        toUser: async function (username: string, password: string) {
            //@ts-ignore
            const newUser = await User.createNewUser(username, this.email, password, this.role);
            await UserInvitation.deleteOne({_id: this._id})

            return newUser
        },
        isExpired: function () {
            return this.expiration.getTime() < Date.now();
        }
    },
    statics: {
        newUserInvitation: async function (email: string, role: string): Promise<IUserInvitation> {
            await this.deleteOne({email: email});

            const newUserInvitation = new this({email: email, role: role});
            await newUserInvitation.save();
            return newUserInvitation as IUserInvitation;
        }

    }
});

const UserInvitation = mongoose.model('UserInvitation', UserInvitationSchema);

export {
    UserInvitation
}
