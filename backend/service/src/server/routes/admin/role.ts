import express from "express";
import BadRequestError from "../../../errors/BadRequestError.ts";
import ConflictError from "../../../errors/ConflictError.ts";
import NotFoundError from "../../../errors/NotFoundError.ts";
import {Role} from "../../../models/db/Roles.ts";
import {RoleResponse} from "../../../models/api/RoleResponse.ts";

const router = express.Router();

router.post(
    '/role',
    async (req, res, next) => {
        try {
            const roleName = req.body.name;
            const roleDescription = req.body.description;
            if (!roleName) {
                throw new BadRequestError();
            }

            //@ts-ignore
            const roleExists = await Role.roleExists(roleName);
            if (roleExists) {
                throw new ConflictError();
            }

            const role = new Role({name: roleName, description: roleDescription});
            await role.save();

            return res.json(new RoleResponse(role._id.toString(), role.name, role.description, role.createdAt));
        } catch (e) {
            next(e);
        }
    }
);

router.get(
    '/role/:id',
    async (req, res, next) => {
        try {
            const roleId = req.params.id;
            if (!roleId) {
                throw new BadRequestError();
            }

            const role = await Role.findOne({_id: roleId}).lean();
            return res.json(new RoleResponse(role._id.toString(), role.name, role.description, role.createdAt));
        } catch (e) {
            next(e);
        }
    }
);

router.get(
    '/roles',
    async (req, res, next) => {
        try {
            const roles = await Role.find().sort({name: 'asc'}).lean();
            return res.json(roles.map(role => new RoleResponse(role._id.toString(), role.name, role.description, role.createdAt)));
        } catch (e) {
            next(e);
        }
    }
);

router.put(
    '/role/:id',
    async (req, res, next) => {
        try {
            const roleId = req.params.id;
            const newName = req.body.name;
            const newDescription = req.body.description || "";

            if (!roleId || !newName) {
                throw new BadRequestError();
            }

            const role = await Role.findOne({_id: roleId})
            if (!role) {
                throw new NotFoundError();
            }

            const updatedRole = await Role.findOneAndUpdate({_id: roleId}, {
                name: newName,
                description: newDescription
            }, {new: true});
            return res.json(new RoleResponse(updatedRole._id.toString(), updatedRole.name, updatedRole.description, updatedRole.createdAt));
        } catch (e) {
            next(e);
        }
    }
);

router.delete(
    '/role/:id',
    async (req, res, next) => {
        try {
            const roleId = req.params.id;

            if (!roleId) {
                throw new BadRequestError();
            }

            const role = await Role.findOne({_id: roleId})
            if (!role) {
                throw new NotFoundError();
            }

            //@ts-ignore
            await Role.deleteRole(role.name);
            return res.json(new RoleResponse(role._id.toString(), role.name, role.description, role.createdAt));
        } catch (e) {
            next(e);
        }
    }
);

export {
    router
}