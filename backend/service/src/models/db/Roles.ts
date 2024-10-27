import mongoose from "mongoose";
import {SystemRoles} from "../../constants/SystemRoles.ts";
import {User} from "./User.ts";
import {Settings} from "./Settings.ts";

const Schema = mongoose.Schema;

const RoleSchema = new Schema({
    name: {type: String, required: true, unique: true},
    description: {type: String},
}, {timestamps: true});

RoleSchema.statics.initRoles = async function (roles: Array<string>) {
    //@ts-ignore
    const systemRoles = await Role.initSystemRoles();

    const customRoles = await Promise.all(roles.map(async role => {
        return Role.findOneAndUpdate({name: role}, {name: role}, {new: true, upsert: true});
    }))

    const newRoles = [...systemRoles, ...customRoles.map(role => role.name)];

    //Set user role to "USER" if the users's role doesn't exist anymore after initializing the new roles
    await User.updateMany({ role: { $nin: newRoles }}, {role: SystemRoles.USER})

    return newRoles
}

RoleSchema.statics.initSystemRoles = async function () {
    await Role.findOneAndUpdate({name:  SystemRoles.ADMIN}, {name:  SystemRoles.ADMIN, description: "The administrator of the user management system. This role has all rights."}, {new: true, upsert: true});
    await Role.findOneAndUpdate({name:  SystemRoles.USER}, {name:  SystemRoles.USER, description: "The default role of the user management system."}, {new: true, upsert: true});

    return [SystemRoles.ADMIN, SystemRoles.USER]
}

RoleSchema.statics.roleExists = async function (roleName: string) {
    const allRoles = await Role.find().lean();
    return allRoles.some(r => r.name === roleName)
}

RoleSchema.statics.deleteRole = async function (role: string) {
    //@ts-ignore
    const settings = await Settings.load();
    if(settings.defaultRole === role){
        settings.defaultRole = SystemRoles.USER;
        await settings.save();
    }

    //Update users - set default role
    await User.updateMany({role: role}, {role: settings.defaultRole});
    //delete role
    await Role.deleteOne({name: role});
}


const Role = mongoose.model('Role', RoleSchema);

export {
    Role
}
