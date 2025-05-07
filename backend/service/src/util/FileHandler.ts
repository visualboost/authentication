import fsPromise from "fs/promises";
import fs from "fs";
import path from "path";
import {Role} from "../models/util/Role.ts";

const getRoleDir = (): string => {
    return path.join(process.cwd(), "roles");
}

const getRoleFilePath = (): string => {
    return path.join(getRoleDir(), "roles.json");
}

const getAssetDir = (): string => {
    return path.join(process.cwd(), "assets");
}

const getTemplateDir = (): string => {
    return path.join(process.cwd(), "templates");
}

/**
 * Copies the html templates (mostly used for emails) to tge assets directory.
 * This is necessary if a docker volume is mounted, otherwise directory would be empty.
 */
const initAssets = async () => {
    console.log("Start initializing templates ...")
    const assetDir = getAssetDir();
    const templateDir = getTemplateDir();

    const files = await fsPromise.readdir(getAssetDir());

    if (fs.existsSync(templateDir) === false) {
        await fsPromise.mkdir(templateDir)
    }

    for (let i = 0; i < files.length; i++) {
        const templateInTemplateDir = path.join(templateDir, files[i]);
        if (fs.existsSync(templateInTemplateDir) === false) {
            await fsPromise.cp(path.join(getAssetDir(), files[i]), templateInTemplateDir);
            console.log("Created " + templateInTemplateDir)
        }
    }
}

const getTemplate = async (filename: string, placeHolders: object = undefined) => {
    const asset = path.join(getTemplateDir(), filename);
    const plainAsset = await fsPromise.readFile(asset, 'utf8')
    if (!placeHolders) return plainAsset;

    return replacePlaceHolders(plainAsset, placeHolders)
}

const getApiDocumentation = async () => {
    return getTemplate("redoc-static.html")
}

const replacePlaceHolders = (fileContent: string, placeHolders: object) => {
    if (!placeHolders) return fileContent;

    const propertyRegex = new RegExp(/\${[A-Za-z_]*}/g)
    const props = [...new Set(fileContent.match(propertyRegex))]
    props.forEach(prop => {
        const propertyName = prop.replace("${", "").replace("}", "")
        //@ts-ignore
        const propertyValue = placeHolders[propertyName];
        const replaceRegex = new RegExp("\\${" + propertyName + "}", 'g')
        fileContent = fileContent.replace(replaceRegex, propertyValue)
    })
    return fileContent;
}

const getRolesByFile = async ():Promise<Array<Role>> => {
    const roleFile = getRoleFilePath();

    if (fs.existsSync(roleFile) === false) {
        return [];
    }

    const roleContent = await fsPromise.readFile(roleFile, 'utf8');
    if (roleContent.length === 0) return [];

    let roleContentAsJson;
    try {
        roleContentAsJson = JSON.parse(roleContent);
    } catch (e) {
        throw Error("Invalid role file: " + roleFile);
    }

    if (!Array.isArray(roleContentAsJson)) {
        throw Error("Role file: " + roleFile + " is not an array");
    }

    const roleObjDoesNotContainNameAttribute = roleContentAsJson.some(roleObj => !roleObj.name)
    if (roleObjDoesNotContainNameAttribute) throw Error("Missing attribute name in role file: " + roleFile);

    return roleContentAsJson.map(role => new Role(role.name));
}


export {
    initAssets,
    getTemplate,
    getApiDocumentation,
    getRolesByFile,
    getRoleFilePath
}
