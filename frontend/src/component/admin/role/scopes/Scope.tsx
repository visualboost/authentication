class Scope {

    static readonly READ = "read"
    static readonly WRITE = "write"

    static Resources = class {
        static readonly USER = "user"
        static readonly ROLE = "role"
        static readonly SETTINGS = "settings"
        static readonly STATISTICS = "statistics"
        static readonly BLACKLIST = "blacklist"
        static readonly SCOPE = "scope"
    }

    static createId(...paths: string[]): string {
        return paths.join(".")
    }

    /**
     * Create and read scopes
     */
    static getAllScopes(): string[] {
        return [Scope.READ, Scope.WRITE]
    }

    static Scopes = class {

        /**
         * Read scopes of a rule
         * Endpoints:
         *  - /admin/role/:id (GET)
         *  - /admin/roles (GET)
         */
        static readonly READ = Scope.createId(Scope.Resources.SCOPE, Scope.READ)

        /**
         * Read scopes of a rule
         * Endpoints:
         *  - /admin/role (POST)
         *  - /admin/role/:id (PUT)
         *  - /admin/role/:id (DELETE)
         */
        static readonly WRITE = Scope.createId(Scope.Resources.SCOPE, Scope.WRITE)

        static getAllScopes(): string[] {
            return [Scope.Scopes.READ, Scope.Scopes.WRITE]
        }
    }

    static User = class {

        /**
         * Read multiple users
         * Endpoint: /admin/user
         */
        static readonly READ = Scope.createId(Scope.Resources.USER, Scope.READ)

        /**
         * Read multiple users
         * Endpoint: /admin/user
         */
        static readonly READ_MULTIPLE = Scope.createId(Scope.Resources.USER, Scope.READ) + ":all"

        /**
         * Create and delete a user
         * Endpoints:
         *  - /admin/add (POST)
         *  - /admin/user/:userId (DELETE)
         */
        static readonly WRITE = Scope.createId(Scope.Resources.USER, Scope.WRITE)

        /**
         * Invite new user
         * Endpoint: /admin/add
         */
        static readonly INVITE = Scope.createId(Scope.Resources.USER, Scope.WRITE) + ":invite"

        /**
         * Change email of another user
         */
        static readonly CHANGE_EMAIL = Scope.createId(Scope.Resources.USER, Scope.WRITE) + ":email"

        /**
         * Update the role of a user
         * Endpoint: /admin/user/:userId/role
         */
        static readonly CHANGE_ROLE = Scope.createId(Scope.Resources.USER, Scope.WRITE) + ":role"


        static getAllScopes(): string[] {
            return [Scope.User.READ, Scope.User.READ_MULTIPLE, Scope.User.WRITE, Scope.User.INVITE, Scope.User.CHANGE_EMAIL, Scope.User.CHANGE_ROLE]
        }
    }

    static Role = class {

        /**
         * Read role details.
         * The scope is only required if the user ID of the current auth token differs from the user ID in the path.
         *
         * Endpoints:
         *  - /user/:id (GET)
         */
        static readonly READ = Scope.createId(Scope.Resources.USER, Scope.Resources.ROLE, Scope.READ)

        /**
         * Create, update, delete user role
         * Endpoints:
         *  - /admin/role (POST)
         *  - /admin/role/:id (PUT)
         *  - /admin/role/:id (DELETE)
         *
         */
        static readonly WRITE = Scope.createId(Scope.Resources.USER, Scope.Resources.ROLE, Scope.WRITE)

        static getAllScopes(): string[] {
            return [Scope.Role.READ, Scope.Role.WRITE]
        }
    }

    static Blacklist = class {

        /**
         * Read blacklist entry
         *
         * Endpoint: /admin/blacklist (GET)
         */
        static readonly READ = Scope.createId(Scope.Resources.BLACKLIST, Scope.READ)
        /**
         * Create blacklist entry
         *
         * Endpoints:
         *  - /admin/blacklist/email (POST)
         *  - /admin/blacklist/email (DELETE)
         *  - /admin/blacklist/ip (POST)
         *  - /admin/blacklist/ip (DELETE)
         */
        static readonly WRITE = Scope.createId(Scope.Resources.BLACKLIST, Scope.WRITE)

        static getAllScopes(): string[] {
            return [Scope.Blacklist.READ, Scope.Blacklist.WRITE]
        }
    }

    static Settings = class {

        /**
         * Read settings
         * Endpoint: /admin/settings (GET)
         */
        static readonly READ = Scope.createId(Scope.Resources.SETTINGS, Scope.READ)

        /**
         * Update settings
         *
         * Endpoint:
         *  - /admin/settings (PUT)
         *  - /admin/settings/encrypt/emails (POST)
         */
        static readonly WRITE = Scope.createId(Scope.Resources.SETTINGS, Scope.WRITE)

        static getAllScopes(): string[] {
            return [Scope.Settings.READ, Scope.Settings.WRITE]
        }

    }

    static Statistics = class {

        /**
         * Read settings
         *
         * Endpoint: /admin/statistics
         */
        static readonly READ = Scope.createId(Scope.Resources.STATISTICS, Scope.READ)

        static getAllScopes(): string[] {
            return [Scope.Statistics.READ]
        }

    }

}

export default Scope