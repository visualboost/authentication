import * as crypto from 'crypto';
import {Settings} from "../models/db/Settings.ts";
import fs from "fs";
import bcrypt from "bcrypt";
import {isDevEnvironment} from "./ConfigUtil.ts";
import {DatabaseConfig} from "../models/util/DatabaseConfig.ts";
import {MailConfig} from "../models/util/MailConfig.ts";
import {ServerConfig} from "../models/util/ServerConfig.ts";

interface EncryptionKey {
    key: string;
    iv: string;
}

/**
 * Read the docker secret - necessary for production mode
 */
const getDockerSecret = (secretName: string): string | null => {
    const filePath = "/run/secrets/" + secretName;

    if(!fs.existsSync(filePath)) return null;
    return fs.readFileSync("/run/secrets/" + secretName, "utf8");
}

/**
 * The jwt secret to sign and verify the refresh token
 */
const getRefreshTokenSecret = (): string => {
    let refreshTokenSecret;

    if (isDevEnvironment()) {
        refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    } else {
        refreshTokenSecret = getDockerSecret("refresh_token_secret");
    }

    if (!refreshTokenSecret) {
        throw Error("Missing refresh token");
    }

    return refreshTokenSecret;
}

/**
 * The jwt secret to sign and verify the authentication token
 */
const getAuthenticationTokenSecret = (): string => {
    let authTokenSecret;

    if (isDevEnvironment()) {
        authTokenSecret = process.env.AUTH_TOKEN_SECRET
    } else {
        authTokenSecret = getDockerSecret("auth_token_secret");
    }

    if (!authTokenSecret) {
        throw Error("Missing auth token");
    }

    return authTokenSecret;
}

/**
 * Encryption key must have the following structure <32 byte string>_<16 byte string>
 */
const getEncryptionKey = (): EncryptionKey => {
    let key;
    let iv;

    if (isDevEnvironment()) {
        key = process.env.DEV_ENCRYPTION_KEY?.split("_")[0];
        iv = process.env.DEV_ENCRYPTION_KEY?.split("_")[1];
    } else {
        const encryptionKey = getDockerSecret("encryption_key");
        key = encryptionKey?.split("_")[0];
        iv = encryptionKey?.split("_")[1];
    }

    if (!key || !iv) {
        throw new Error("Missing encryption key");
    }

    return {
        key: key,
        iv: iv,
    };
}

/**
 * Load all keys to check if every secret is defined
 */
const validateSecrets = () => {
    getEncryptionKey()
    getAuthenticationTokenSecret()
    getRefreshTokenSecret()

    DatabaseConfig.init();
    MailConfig.init();
    ServerConfig.init();
}

const hash = async (value: string): Promise<string> => {
    return bcrypt.hash(value, 10)
}

const encrypt = (value: string): string => {
    const encryptionKey = getEncryptionKey();
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey.key, encryptionKey.iv);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

const encryptEmailIfAllowedBySystem = async (value: string): Promise<string> => {
    const isEncryptionEnabled = await Settings.getEmailEncryptionEnabled();
    if (isEncryptionEnabled) {
        return encrypt(value);
    }

    return value;
}

const decrypt = (encryptedValue: string): string => {
    const encryptionKey = getEncryptionKey();
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey.key, encryptionKey.iv);
    let decrypted = decipher.update(encryptedValue, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

const decryptEmailIfAllowedBySystem = async (value: string): Promise<string> => {
    const isEncryptionEnabled = await Settings.getEmailEncryptionEnabled();
    if (isEncryptionEnabled) {
        return decrypt(value);
    }

    return value;
}

export {
    hash,
    encrypt,
    decrypt,
    encryptEmailIfAllowedBySystem,
    decryptEmailIfAllowedBySystem,
    getAuthenticationTokenSecret,
    getDockerSecret,
    getEncryptionKey,
    getRefreshTokenSecret,
    validateSecrets
}
