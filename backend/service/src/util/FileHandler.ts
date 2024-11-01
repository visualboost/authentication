import fsPromise from "fs/promises";
import fs from "fs";
import path from "path";

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


export {
    initAssets,
    getTemplate
}
