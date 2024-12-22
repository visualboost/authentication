import express from "express";
import BadRequestError from "../../../errors/BadRequestError.ts";
import ConflictError from "../../../errors/ConflictError.ts";
import NotFoundError from "../../../errors/NotFoundError.ts";
import {Role} from "../../../models/db/Roles.ts";
import {RoleResponse} from "../../../models/api/RoleResponse.ts";
import {hasReadRoleScope, hasWriteRoleScope} from "../../middlewares/scope/hasRoleScopesMiddleware.ts";
import {JwtContent} from "../../../models/api/JwtContent.ts";
import Scope from "../../../constants/role/Scope.ts";

const router = express.Router();

router.get(
    '/role/:id',
    hasReadRoleScope,
    async (req, res, next) => {
        try {
            const authToken = res.locals.authToken as JwtContent;
            const roleId = req.params.id;
            if (!roleId) {
                throw new BadRequestError();
            }

            const role = await Role.findOne({_id: roleId}).lean();
            if(!role) {
                throw new NotFoundError();
            }

            if (authToken.containsScopes(Scope.Scopes.READ)) {
                return res.json(new RoleResponse(role._id.toString(), role.name, role.description, role.createdAt, role.scopes));
            }
            return res.json(new RoleResponse(role._id.toString(), role.name, role.description, role.createdAt));
        } catch (e) {
            next(e);
        }
    }
);

router.get(
    '/roles',
    hasReadRoleScope,
    async (req, res, next) => {
        try {
            const authToken = res.locals.authToken as JwtContent;

            const roles = await Role.find().sort({name: 'asc'}).lean();
            return res.json(roles.map(role => {
                if (authToken.containsScopes(Scope.Scopes.READ)) {
                    return new RoleResponse(role._id.toString(), role.name, role.description, role.createdAt, role.scopes);
                }

                return new RoleResponse(role._id.toString(), role.name, role.description, role.createdAt)
            }));
        } catch (e) {
            next(e);
        }
    }
);


/**
 * Create a new role
 */
router.post(
    '/role',
    hasWriteRoleScope,
    async (req, res, next) => {
        try {
            const authToken = res.locals.authToken as JwtContent;
            const roleName = req.body.name;
            const roleDescription = req.body.description;

            /**
             * Set scopes is only allowed if user has the scope
             */
            let scopes = req.body.scopes;
            if (!authToken.containsScopes(Scope.Scopes.WRITE)) {
                scopes = [];
            }

            if (!roleName) {
                throw new BadRequestError();
            }

            //@ts-ignore
            const roleExists = await Role.roleExists(roleName);
            if (roleExists) {
                throw new ConflictError();
            }

            const role = new Role({name: roleName, description: roleDescription, scopes: scopes});
            await role.save();

            if (authToken.containsScopes(Scope.Scopes.READ)) {
                return res.json(new RoleResponse(role._id.toString(), role.name, role.description, role.createdAt, role.scopes));
            }

            return res.json(new RoleResponse(role._id.toString(), role.name, role.description, role.createdAt));
        } catch (e) {
            next(e);
        }
    }
);

/**
 * Update a role
 */
router.put(
    '/role/:id',
    hasWriteRoleScope,
    async (req, res, next) => {
        try {
            const authToken = res.locals.authToken as JwtContent;

            const roleId = req.params.id;
            const newName = req.body.name;
            const newDescription = req.body.description || "";
            let scopes = req.body.scopes;

            if (!roleId || !newName) {
                throw new BadRequestError();
            }

            const role = await Role.findOne({_id: roleId})
            if (!role) {
                throw new NotFoundError();
            }

            const updateBody = {
                name: newName,
                description: newDescription
            }

            /**
             * Write scopes only if the user is allowed
             */
            if (authToken.containsScopes(Scope.Scopes.WRITE)) {
                //@ts-ignore
                updateBody["scopes"] = scopes;
            }

            const updatedRole = await Role.findOneAndUpdate({_id: roleId}, updateBody, {new: true});

            if (authToken.containsScopes(Scope.Scopes.READ)) {
                return res.json(new RoleResponse(updatedRole._id.toString(), updatedRole.name, updatedRole.description, updatedRole.createdAt, updatedRole.scopes));
            }

            return res.json(new RoleResponse(updatedRole._id.toString(), updatedRole.name, updatedRole.description, updatedRole.createdAt));
        } catch (e) {
            next(e);
        }
    }
);

router.delete(
    '/role/:id',
    hasWriteRoleScope,
    async (req, res, next) => {
        try {
            const authToken = res.locals.authToken as JwtContent;

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

            if (authToken.containsScopes(Scope.Scopes.READ)) {
                return res.json(new RoleResponse(role._id.toString(), role.name, role.description, role.createdAt, role.scopes));
            }
            return res.json(new RoleResponse(role._id.toString(), role.name, role.description, role.createdAt));
        } catch (e) {
            next(e);
        }
    }
);

export {
    router
}