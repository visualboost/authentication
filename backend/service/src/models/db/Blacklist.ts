import mongoose, {Model} from "mongoose";
import {User} from "./User.ts";
import {decrypt, encrypt, encryptEmailIfAllowedBySystem} from "../../util/EncryptionUtil.ts";

const Schema = mongoose.Schema;

export interface IBlacklist extends mongoose.Document {
    ip?: string;
    email?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IBlacklistModel extends Model<IBlacklist> {
    addEmail(email: string): Promise<void>;
    deleteEmail(email: string): Promise<void>;
    addIP(ip: string): Promise<void>;
    deleteIP(ip: string): Promise<void>;
    isBlocked(ip: string, email: string): Promise<boolean>;
    encryptAll(session: mongoose.mongo.ClientSession): Promise<void>;
    decryptAll(session: mongoose.mongo.ClientSession): Promise<void>;
}

/**
 * Can be used to block IPs or E-Mails
 */
const BlacklistSchema = new Schema<IBlacklist, IBlacklistModel>({
    ip: {type: String, indexed: true, unique: true, sparse: true},
    email: {type: String, indexed: true, unique: true, sparse: true}
}, {
    timestamps: true,
    statics: {
        addEmail: async function (mail: string) {
            const email = await encryptEmailIfAllowedBySystem(mail.toLowerCase())
            const emailBlacklistObj = new Blacklist({email: email});
            await emailBlacklistObj.save();

            const user = await User.getByEmail(email);
            if (user) {
                await user.block();
            }
        },
        deleteEmail: async function (mail: string) {
            const email = await encryptEmailIfAllowedBySystem(mail.toLowerCase())
            await Blacklist.deleteOne({email: email});

            const user = await User.getByEmail(email);
            if (user) {
                await user.activate();
            }
        },
        addIP: async function (ip: string) {
            const ipBlacklistObj = new Blacklist({ip: ip});
            await ipBlacklistObj.save();

            const user = await User.getByIP(ip, false);
            if (user) {
                await user.block();
            }
        },
        deleteIP: async function (ip: string) {
            await Blacklist.deleteOne({ip: ip});

            //@ts-ignore
            const user = await User.getByIP(ip);
            if (user) {
                await user.activate();
            }
        },
        isBlocked: async function (ip: string, mail: string): Promise<boolean> {
            const email = await encryptEmailIfAllowedBySystem(mail.toLowerCase())
            const blackListedObj = await Blacklist.exists({$or: [{email: email}, {ip: ip}]})
            if (blackListedObj) {
                return true;
            }

            return false;
        },
        encryptAll: async function (session: mongoose.mongo.ClientSession) {
            const blacklistItems = await this.find({}, {_id: 1, email: 1}).lean();

            const blacklistUpdates = blacklistItems.map(blacklistItem => {
                if (!blacklistItem.email.includes("@")) return null;
                //Only encrypt email if it contains '@' (means it is not yet encrypted)
                let email = encrypt(blacklistItem.email);

                return {
                    updateOne: {
                        filter: {_id: blacklistItem._id},
                        update: {
                            $set: {
                                email: email
                            }
                        }
                    }
                }
            })

            await this.bulkWrite(blacklistUpdates.filter(bulkWriteOperation => bulkWriteOperation !== null), {session});
        },
        decryptAll: async function (session: mongoose.mongo.ClientSession) {
            const blacklistItems = await this.find({}, {_id: 1, email: 1}).lean();

            const blacklistUpdates = blacklistItems.map(blacklistItem => {
                //Only decrypt email if it does not contain '@' (means it is not yet decrypted)
                if (blacklistItem.email.includes("@")) return null;
                let email = decrypt(blacklistItem.email);

                return {
                    updateOne: {
                        filter: {_id: blacklistItem._id},
                        update: {$set: {email: email}}
                    }
                }
            })

            //Decrypt all emails
            await this.bulkWrite(blacklistUpdates.filter(bulkWriteOperation => bulkWriteOperation !== null), {session});
        }
    }
});

const Blacklist = mongoose.model<IBlacklist, IBlacklistModel>('Blacklist', BlacklistSchema);

export {
    Blacklist
}
