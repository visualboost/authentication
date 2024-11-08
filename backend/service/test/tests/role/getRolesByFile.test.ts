import {getRoleFilePath, getRolesByFile} from '../../../src/util/FileHandler.ts';
import fs from 'fs';
import fsPromise from 'fs/promises';
import {Role} from "../../../src/models/util/Role.ts";
import path from "path";

jest.mock('fs');
jest.mock('fs/promises');

describe('getRolesByFile', () => {
    const mockRoleFilePath = getRoleFilePath();

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('File path for roles is "*/roles/roles.json"', async () => {
        const filePath = getRoleFilePath();
        const pathSegments = filePath.split(path.sep);

        const fileName = pathSegments.pop();
        const dir = pathSegments.pop();

        expect(fileName).toEqual("roles.json");
        expect(dir).toEqual("roles");

    });

    test('should return an empty array if the role file does not exist', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        const result = await getRolesByFile();

        expect(result).toEqual([]);
        expect(fs.existsSync).toHaveBeenCalledWith(mockRoleFilePath);
    });

    test('should return an empty array if the role file is empty', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fsPromise.readFile as jest.Mock).mockResolvedValue('');

        const result = await getRolesByFile();

        expect(result).toEqual([]);
        expect(fsPromise.readFile).toHaveBeenCalledWith(mockRoleFilePath, 'utf8');
    });

    test('should throw an error if the role file content is invalid JSON', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fsPromise.readFile as jest.Mock).mockResolvedValue('invalid json');

        await expect(getRolesByFile()).rejects.toThrow(`Invalid role file: ${mockRoleFilePath}`);
    });

    test('should throw an error if the role file content is not an array', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fsPromise.readFile as jest.Mock).mockResolvedValue(JSON.stringify({ key: 'value' }));

        await expect(getRolesByFile()).rejects.toThrow(`Role file: ${mockRoleFilePath} is not an array`);
    });

    test('should throw an error if a role object does not contain a "name" attribute', async () => {
        const invalidRoleArray = [{}, { name: 'Admin' }];
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fsPromise.readFile as jest.Mock).mockResolvedValue(JSON.stringify(invalidRoleArray));

        await expect(getRolesByFile()).rejects.toThrow(`Missing attribute name in role file: ${mockRoleFilePath}`);
    });

    test('should return an array of Role instances if the role file content is valid', async () => {
        const validRoleArray = [{ name: 'Admin' }, { name: 'User' }];
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fsPromise.readFile as jest.Mock).mockResolvedValue(JSON.stringify(validRoleArray));

        const result = await getRolesByFile();

        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(Role);
        expect(result[0].name).toBe('Admin');
        expect(result[1]).toBeInstanceOf(Role);
        expect(result[1].name).toBe('User');
    });
});
