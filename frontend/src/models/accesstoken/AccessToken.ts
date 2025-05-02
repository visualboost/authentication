export class AccessToken {
    private _id: string;
    private name: string;
    private expiresIn: Date;
    private scopes: string[];

    constructor(_id: string, name: string, expiresIn: Date, scopes: string[]) {
        this._id = _id;
        this.name = name;
        this.expiresIn = expiresIn;
        this.scopes = scopes;
    }

    getID(): string {
        return this._id;
    }

    getName(): string {
        return this.name;
    }

    getExpiresIn(): Date {
        return this.expiresIn;
    }

    getScopes(): string[] {
        return this.scopes;
    }

    isExpired(): boolean {
        return new Date() > this.expiresIn;
    }

    static fromJson(json: AccessToken): AccessToken {
        return new AccessToken(json._id, json.name, new Date(json.expiresIn), json.scopes);
    }
}