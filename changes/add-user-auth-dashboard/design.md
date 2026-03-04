## Context
El sistema de tareas actual utiliza memoria volátil y no tiene un control de acceso ni autenticación. Todos pueden ver y editar todas las tareas y la "asignación de usuarios" anterior era solo un campo nominal sin seguridad. Ahora necesitamos implementar autenticación real, asociar tareas de manera estricta y privada, y proveer métricas globales en un panel (dashboard).

## Goals / Non-Goals

**Goals:**
- Implementar autenticación robusta mediante API (`/login`, `/registro`).
- Almacenar contraseñas de manera segura utilizando hashing (bcrypt).
- Proteger el modelo de `Tarea` inyectando el token de autenticación para asegurar la autoría.
- Modificar el archivo principal `specs/api.yaml` para reflejar estas adiciones.
- Generar endpoints de métricas y dashboard de uso libre.

**Non-Goals:**
- No instalaremos bases de datos SQL/NoSQL completas todavía (se mantendrán arrays en memoria para la demo, pero la arquitectura API será definitiva).
- No abordaremos flujos complejos como recuperación de contraseñas por email ni OAuth.

## Decisions

- **Autenticación mediante JWT (JSON Web Tokens):** Elegido en vez de sesiones persistentes (cookies / stateful) para mantener nuestro backend Node/Express escalable y "stateless".
- **Bcryptjs:** Utilizado para el hasheo de contraseñas, asegurando que si los datos en memoria fuesen extraídos, las credenciales seguirían protegidas.
- **Métricas Computadas al Vuelo:** El Endpoint `/dashboard` no almacenará datos estáticos de estadísticas, sino que se calcularán dinámicamente cada vez que se invoque, basado en el estado actual del arreglo en memoria para asegurar precisión en la demo.

## Risks / Trade-offs

- **[Volatilidad de Datos] ->** La falta de base de datos significa que las cuentas creadas se pierden al reiniciar el script `server.js`. Mitigación: Documentar claramente que es un entorno demo o evaluar guardar en disco en iteraciones futuras.
- **[Complejidad de UI] ->** JWT obliga a manejar tokens localmente en el `localStorage` del frontend Vanilla JS. Mitigación: Generar un cliente interceptor limpio o actualizar los `fetch` manualmente en el paso de implementación.
