## ADDED Requirements

### Requirement: Panel Global de Métricas
El sistema MUST exponer una ruta pública o semipública de tablero de control (Dashboard) que consolide las estadísticas operacionales.

#### Scenario: Obtener métricas de la demo
- **WHEN** el cliente hace una petición GET a `/dashboard`.
- **THEN** se devuelve un objeto `Estadisticas` que calcula y muestra las `tareas_completadas`, `tareas_pendientes` y la `tasa_exito` actual.
