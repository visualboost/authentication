# Versions:

## 1.0.2

- Added more logs
- ``username`` is not unique anymore, only ``email`` is still unique.
- Removed redundant PATCH function ``/modifiy/password``.
- ``Roles.initRoles`` ignores default roles ``ADMIN`` and ``USER``
- Added documentation (openapi.json, redoc-static.html, client.http)

## 1.0.1 (08.11.2024)

- Implemented `FileHandler.getRolesByFile` and `Role.initRolesByFile` to initialize roles during application startup from ``./roles/roles.json``.

## 1.0.0

- Initial Version
