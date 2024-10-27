/**
 * Deprecated, 08.10.2024 - Too many resources in use (10000 user = ~2000000 ngram docs)
 */
import mongoose, {ClientSession, Model, ObjectId} from "mongoose";
import {encrypt} from "../../util/EncryptionUtil.ts";
import {Settings} from "./Settings.ts";

const Schema = mongoose.Schema;

export interface INGram extends mongoose.Document {
    userId: ObjectId;
    fieldName: string;
    value: string;
}

export interface INGramModel extends Model<INGram> {
    createByValue(userId: ObjectId, fieldName: string, value: string, session: ClientSession | null): Promise<void>;
    clearField(userId: ObjectId, fieldName: string): Promise<void>
}

/**
 * N-Gram schema to create searchable tokens.
 * Example: We can crate an n-gram of the email-address of a user. That allows us to encrypt the email address of the user but let us execute search actions (startWith).
 */
const NGramSchema = new Schema<INGram, INGramModel>({
    userId: {type: Schema.Types.ObjectId, ref: 'User'},
    fieldName: {type: String, required: true, indexed: true},
    value: {type: String, required: true, indexed: true}
}, {
    timestamps: false,
    statics: {
        /**
         * Creates an n-gram of a specific field.
         */
        createByValue: async function(userId: ObjectId, fieldName: string, value: string, session: ClientSession | null): Promise<void> {
            const encryptEmailEnabled = await Settings.getEmailEncryptionEnabled();
            if(!encryptEmailEnabled) return;

            if (!value || value.length < 1) return;

            //Skip the first 3 characters - min length of search chars need to be 3
            const skipFirstLettersIndex = 3;

            let nGram =  value.substring(0,skipFirstLettersIndex);
            let nGramDocs = [];

            for(let i = skipFirstLettersIndex; i < value.length; i++) {
                nGram += value[i];
                const encryptedNGram = encrypt(nGram);
                nGramDocs.push(new this({userId: userId, fieldName: fieldName, value: encryptedNGram}));
            }

            await this.insertMany(nGramDocs, {session});
        },
        /**
         * Clear the n-gram of a user
         * @param userId
         * @param fieldName
         */
        async clearField(userId: ObjectId, fieldName: string) {
            await this.deleteMany({userId: userId, fieldName: fieldName});
        }
    }
});

const NGram = mongoose.model<INGram, INGramModel>('NGram', NGramSchema);

export {
    NGram
}
