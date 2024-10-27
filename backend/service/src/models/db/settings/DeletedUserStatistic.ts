import mongoose from "mongoose";
const Schema = mongoose.Schema;

const DeletedUserStatisticSchema = new Schema({
    userId: {required: true, type: Schema.Types.ObjectId},
}, {timestamps: {createdAt: true, updatedAt: false}});

DeletedUserStatisticSchema.statics.logUserDeleted = async function (userId: string){
    const deletedUser = new DeletedUserStatisticModel({userId: userId});
    await deletedUser.save();
}

const DeletedUserStatisticModel = mongoose.model('DeletedUserStatistic', DeletedUserStatisticSchema);

export {
    DeletedUserStatisticModel
}
