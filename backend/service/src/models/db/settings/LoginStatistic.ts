import mongoose from "mongoose";

const Schema = mongoose.Schema;

const FailedLoginAttemptsSchema = new Schema({
    ip: {required: false, type: String},
    email: {required: false, type: String},
}, {
    timestamps: {createdAt: true, updatedAt: false},
    statics: {
        logFailedLoginAttempt: async function (ip: string | null, email: string) {
            const failedLoginAttempt = new this({ip: ip, email: email});
            await failedLoginAttempt.save();
        }
    }
});

const FailedLoginAttemptsModel = mongoose.model('FailedLoginAttempts', FailedLoginAttemptsSchema);

export {
    FailedLoginAttemptsModel
}
