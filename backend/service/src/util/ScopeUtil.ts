import Scope from "../constants/role/Scope.ts";

const ensureReadScopesForWriteScopes = (scopes: string[]): string[] => {
    const scopeSet = new Set(scopes);

    if(scopeSet.has(Scope.Scopes.WRITE)) {
        scopeSet.add(Scope.Scopes.READ);
    }

    if(scopeSet.has(Scope.Role.WRITE)) {
        scopeSet.add(Scope.Role.READ);
    }

    if(scopeSet.has(Scope.Blacklist.WRITE)) {
        scopeSet.add(Scope.Blacklist.READ);
    }

    if(scopeSet.has(Scope.Settings.WRITE)) {
        scopeSet.add(Scope.Settings.READ);
    }

    return Array.from(scopeSet);
}



export {
    ensureReadScopesForWriteScopes,
}
