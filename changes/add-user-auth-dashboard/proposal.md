## Why

El sistema de gestión de tareas actual almacena la información de usuarios en memoria de forma no segura y no tiene un sistema de autenticación real. Para escalar la aplicación y permitir a múltiples usuarios interactuar de forma segura y privada, necesitamos evolucionar la API para soportar autenticación profunda, privacidad por usuario, y un panel de control (dashboard).

## What Changes

- **Autenticación (NUEVO)**: Creación de rutas de `/registro` y `/login` para emitir tokens/sesiones.
- **Modelado Seguro (MODIFICADO)**: Almacenamiento seguro usando `password_hash` en el modelo `Usuario`.
- **Privacidad (MODIFICADO)**: Actualización del modelo `Tarea` para enlazar un `usuario_id` obligatoriamente, garantizando que cada quien vea y modifique solo lo suyo. **BREAKING** (Las tareas ahora requerirán usuario).
- **Métricas (NUEVO)**: Implementación de rutas como `/dashboard` para ver estadísticas operacionales globales de la demo.

## Capabilities

### New Capabilities
- `user-auth`: Sistema de registro y autenticación de usuarios mediante credenciales encriptadas.
- `dashboard-stats`: Consolidación de información para métricas globales (tareas pendientes, completadas, ratio de éxito).

### Modified Capabilities
- `task-management`: Modificación de los requisitos de creación y listado de tareas para forzar la vinculación estructural con `usuario_id` en vez de cadenas sueltas.

## Impact

- `specs/api.yaml` será profundamente modificado.
- `server.js` deberá integrar dependencias de criptografía (ej. `bcrypt`) y gestión de tokens (ej. `jsonwebtoken`).
- Rutas actuales como `GET /tasks` requerirán filtrado basado en la sesión del usuario.
- Interfaz Frontend (`public/`) requerirá pantallas de Login/Registro y un panel de Dashboard.
