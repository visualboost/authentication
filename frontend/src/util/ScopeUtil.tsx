import Scope from "../component/admin/role/scopes/Scope.tsx";

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

const ensureWriteScopesForReadScopes = (scopes: string[]): string[] => {
    const scopeSet = new Set(scopes);

    if(scopeSet.has(Scope.Scopes.READ)) {
        scopeSet.add(Scope.Scopes.WRITE);
    }

    if(scopeSet.has(Scope.Role.READ)) {
        scopeSet.add(Scope.Role.WRITE);
    }

    if(scopeSet.has(Scope.Blacklist.READ)) {
        scopeSet.add(Scope.Blacklist.WRITE);
    }

    if(scopeSet.has(Scope.Settings.READ)) {
        scopeSet.add(Scope.Settings.WRITE);
    }

    return Array.from(scopeSet);
}



export {
    ensureReadScopesForWriteScopes,
    ensureWriteScopesForReadScopes
}
