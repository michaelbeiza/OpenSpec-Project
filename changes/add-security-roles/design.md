# Design: Add Security Roles

## Architecture
Introduciremos un control de acceso basado en roles (RBAC). El token JWT y la base de datos almacenarán la información de rol del usuario. Un nuevo middleware de back-end verificará que el usuario autenticado posea el rol de `admin` para acceder a rutas sensibles.

## Schema Changes (`specs/api.yaml`)
1. **Modelo `Usuario`**:
   - Se añade la propiedad `rol: { type: string, enum: [admin, user], default: user }`.
2. **Endpoints Modificados**:
   - `GET /users` (Listado de Usuarios):
     - Se actualizará el `summary` y `description` indicando: *"Requiere privilegios de 'admin'."*
     - Se añaden las respuestas `401 Unauthorized` y `403 Forbidden`.
   - `DELETE /usuarios/{id}` (Borrar Usuario):
     - Se reemplaza/añade la definición del endpoint indicando en descripción: *"Requiere privilegios de 'admin'."*
     - Se añaden códigos de error: `401 Unauthorized`, `403 Forbidden` y `404 Not Found`.

## Implementation Details (Backend)
- Actualizar la tabla `users` en `database.sqlite` (o en su esquema de creación) para incluir la columna `rol TEXT DEFAULT 'user'`.
- El usuario demo `admin` insertado automáticamente se le asignará explícitamente el rol `admin`.
- Crear un nuevo middleware `verifyAdmin` en `server.js` que reciba y decodifique al usuario desde la base de datos a partir de `req.userId` validando que `user.rol === 'admin'`. En caso contrario, devolverá `HTTP 403 Forbidden`.
- Aplicar `verifyAdmin` a los endpoints `GET /users` y `DELETE /usuarios/{id}`.
