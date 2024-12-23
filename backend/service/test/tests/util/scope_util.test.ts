import Scope from "../../../src/constants/role/Scope.ts";
import {ensureReadScopesForWriteScopes} from "../../../src/util/ScopeUtil.ts";

describe('ensureReadScopesForWriteScopes', () => {
    it('should add READ scope when WRITE scope for Scopes is present', () => {
        const scopes = [Scope.Scopes.WRITE];
        const result = ensureReadScopesForWriteScopes(scopes);
        expect(result).toContain(Scope.Scopes.READ);
    });

    it('should add READ scope when WRITE scope for Role is present', () => {
        const scopes = [Scope.Role.WRITE];
        const result = ensureReadScopesForWriteScopes(scopes);
        expect(result).toContain(Scope.Role.READ);
    });

    it('should add READ scope when WRITE scope for Blacklist is present', () => {
        const scopes = [Scope.Blacklist.WRITE];
        const result = ensureReadScopesForWriteScopes(scopes);
        expect(result).toContain(Scope.Blacklist.READ);
    });

    it('should add READ scope when WRITE scope for Settings is present', () => {
        const scopes = [Scope.Settings.WRITE];
        const result = ensureReadScopesForWriteScopes(scopes);
        expect(result).toContain(Scope.Settings.READ);
    });

    it('should not modify scopes if no WRITE scopes are present', () => {
        const scopes = [Scope.Scopes.READ, Scope.Role.READ];
        const result = ensureReadScopesForWriteScopes(scopes);
        expect(result).toEqual(scopes);
    });

    it('should not duplicate scopes', () => {
        const scopes = [Scope.Scopes.WRITE, Scope.Scopes.READ];
        const result = ensureReadScopesForWriteScopes(scopes);
        const uniqueResult = Array.from(new Set(result));
        expect(result).toEqual(uniqueResult);
    });

    it('should handle an empty scopes array', () => {
        const scopes: string[] = [];
        const result = ensureReadScopesForWriteScopes(scopes);
        expect(result).toEqual([]);
    });

    it('should handle multiple WRITE scopes and add corresponding READ scopes', () => {
        const scopes = [Scope.Scopes.WRITE, Scope.Role.WRITE];
        const result = ensureReadScopesForWriteScopes(scopes);
        expect(result).toContain(Scope.Scopes.READ);
        expect(result).toContain(Scope.Role.READ);
    });
});
