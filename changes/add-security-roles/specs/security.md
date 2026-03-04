# Spec: Security Roles

## Features
- El modelo `Usuario` en `api.yaml` ahora incluye una propiedad `rol` (`enum: ['admin', 'user']`, por defecto `user`).
- Los endpoints de administración, específicamente `GET /users` y `DELETE /usuarios/{id}`, ahora están restringidos exclusivamente a usuarios con el rol `admin`.
- Estos endpoints restringidos deben retornar un código de estado `403 Forbidden` si un usuario autenticado (`user`) intenta acceder a ellos, y `401 Unauthorized` si no hay token válido.

## Acceptance Criteria
- [ ] La definición Swagger de `Usuario` tiene la propiedad `rol`.
- [ ] `DELETE /usuarios/{id}` existe en la especificación y requiere rol `admin`.
- [ ] La documentación de las rutas de listado y borrado de usuarios aclaran explícitamente el requisito de ser `admin`.
- [ ] El backend genera correctamente al usuario `admin` demo con `rol = 'admin'`.
