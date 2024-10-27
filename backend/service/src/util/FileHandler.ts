import fs from "fs/promises";
import path from "path";

const getAsset = async (filename: string, placeHolders: object = undefined) => {
    const asset = path.join(process.cwd(), "assets", filename);
    const plainAsset = await fs.readFile(asset, 'utf8')
    if(!placeHolders) return plainAsset;

    return replacePlaceHolders(plainAsset, placeHolders)
}

const replacePlaceHolders = (fileContent: string, placeHolders: object) => {
    if(!placeHolders) return fileContent;

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
    getAsset
}
