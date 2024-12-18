# Versions:

## 1.0.4 (18.12.2024)

---

### Backend:
- Allow the user to change the expiration time of the authentication token and the refresh token
  - Added: ``tokenExpiration.authenticationToken`` and ``tokenExpiration.refreshToken`` to ``Settings``.

### Frontend:
- Added a component to the ``Login`` settings to allow modification of the authentication token and refresh token expiration time.

## 1.0.3 (14.12.2024)

---

### Docs:
- Adapted openapi description

### Backend:
- No changes

### Frontend:
- No changes

## 1.0.2 (25.11.2024)

---

### Backend:

- Added more logs
- ``username`` is not unique anymore, only ``email`` is still unique.
- Removed redundant PATCH function ``/modifiy/password``.
- ``Roles.initRoles`` ignores default roles ``ADMIN`` and ``USER``
- Added documentation (openapi.json, redoc-static.html, client.http)

### Frontend:
- No changes

## 1.0.1 (08.11.2024)

---

### Backend:

- Initialize roles during application startup from ``./roles/roles.json``

### Frontend:
- No changes

## 1.0.0

- Initial Version
