## ADDED Requirements

### Requirement: Vinculación Estricta a Usuarios Autenticados
El sistema MUST rechazar cualquier tarea que no esté ligada a un `usuario_id` válido. 

#### Scenario: Creación fallida por anonimato
- **WHEN** el usuario intenta crear una tarea (POST `/tasks`) sin proveer un identificador de usuario.
- **THEN** la creación es denegada (`400 Bad Request` o `401 Unauthorized`).

### Requirement: Panel de Tareas Personalizado
El sistema MUST permitir extraer únicamente las tareas pertenecientes a una identidad específica.

#### Scenario: Listado personal
- **WHEN** el cliente envía un requirimiento GET a `/usuarios/{id}/tareas`.
- **THEN** se retorna un array puramente compuesto de tareas cuyo `usuario_id` es el solicitado.
