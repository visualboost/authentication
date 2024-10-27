import mongoose, {ObjectId} from "mongoose";
import {TimeUtil} from "../../util/TimeUtil.ts";

const Schema = mongoose.Schema;

const EXPIRES_IN_MINUTES = 5;

const TwoFactorAuthCodeSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', indexed: true},
    code: {type: String, required: true},
    expiration: {
        type: Date, required: true, default: function () {
            return TimeUtil.createTimeInMinutes(EXPIRES_IN_MINUTES)
        }
    },
}, {
    timestamps: true,
    methods: {
        isExpired: function () {
            return this.expiration.getTime() < Date.now();
        }
    },
    statics: {
        createNewAuthCode: async function (userId: ObjectId | string) {
            await TwoFactorAuthCodeModel.deleteOne({userId: userId});

            const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
            const newTwoFactorAuthDoc = new this({
                userId: userId,
                code: randomCode,
                expiration: TimeUtil.createTimeInMinutes(EXPIRES_IN_MINUTES)
            })
            await newTwoFactorAuthDoc.save();

            return newTwoFactorAuthDoc;
        }
    }
});


const TwoFactorAuthCodeModel = mongoose.model('TwoFactorAuthCode', TwoFactorAuthCodeSchema);

export {
    TwoFactorAuthCodeModel
}
