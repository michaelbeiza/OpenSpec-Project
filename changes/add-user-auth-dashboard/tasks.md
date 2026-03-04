## 1. Setup Data Models & Dependencies

- [x] 1.1 Add `bcryptjs` and `jsonwebtoken` dependencies to package.json
- [x] 1.2 Update `specs/api.yaml` with new models (`Usuario`, `Estadisticas`)
- [x] 1.3 Update `Tarea` model in `specs/api.yaml` to include `usuario_id` instead of `asignadoA`
- [x] 1.4 Add Authentication routes (`/registro`, `/login`) and Dashboard route (`/dashboard`) to API spec.

## 2. Core Backend Authentication

- [x] 2.1 Refactor users array in `server.js` to store passwords securely via `bcrypt.hash()`
- [x] 2.2 Implement `POST /registro` handler logic to create and store the secure account.
- [x] 2.3 Implement `POST /login` handler to verify password and dispatch a signed JWT.
- [x] 2.4 Create an Express middleware `verifyToken` to reject unauthorized requests on private endpoints.

## 3. Core Task Privacy & Metrics

- [x] 3.1 Refactor task creation (`POST /tasks`) to forcefully embed the active user's ID via the validated token.
- [x] 3.2 Update `GET /tasks` or implement `GET /usuarios/{id}/tareas` to exclusively list the caller's tasks.
- [x] 3.3 Implement `GET /dashboard` to compute total completions, backlog volume, and success parameters strictly in real-time.

## 4. Frontend Integration

- [x] 4.1 Generar o modificar UI para permitir Login/Registro inicial antes de ver el panel principal.
- [x] 4.2 Inyectar el token `Authorization: Bearer <token>` en todas las llamadas `fetch()` existentes en los html.
- [x] 4.3 Actualizar reportes del Dashboard para reflejar métricas consolidadas en pantalla.
