# Implementation Tasks: Add Security Roles

## 1. Modificar Esquema OpenAPI (`specs/api.yaml`)
- [ ] Añadir la propiedad `rol` (enum: `['admin', 'user']`, default: `'user'`) al schema `Usuario`.
- [ ] Asegurar que la definición de la ruta `DELETE /usuarios/{id}` (o parecida) esté explícitamente definida en el contrato si estaba previamente abreviada, y especificar que requiere privilegios de `admin`.
- [ ] Añadir los códigos de respuesta `403 Forbidden` y `401 Unauthorized` a `DELETE /usuarios/{id}` y `GET /users`.
- [ ] Modificar las descripciones (summary/description) de las rutas `GET /users` y `DELETE /usuarios/{id}` indicando el requisito de rol `admin`.

## 2. Actualizar Base de Datos (SQLite) en `server.js`
- [ ] Modificar el query de inicialización de la tabla `users` para incluir la columna `rol TEXT DEFAULT 'user'`.
- [ ] Actualizar la inserción hardcodeada de la cuenta `demo_admin` (username 'admin') para asignarle explícitamente `'admin'` en el insert.
- [ ] *(Nota)* Borrar `database.sqlite` (o manejar una migración si aplica) al aplicar este cambio para que las tablas se re-creen con la nueva columna durante testing.

## 3. Implementar Middleware Middleware y Restricciones `verifyAdmin`
- [ ] En `server.js`, crear una función asíncrona o middleware que extienda la validación del token.
- [ ] Consultar el rol del usuario en la Base de Datos usando `req.userId` y validar que `rol === 'admin'`.
- [ ] Aplicar esta validación a los endpoints `app.get('/users', ...)` y `app.delete('/users/:id', ...)` devolviendo el status HTTP correcto (`403` si su rol no es admin, `401` si no hay token).
