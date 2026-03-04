## ADDED Requirements

### Requirement: Registro de Usuario Seguro
El sistema MUST permitir la creación de nuevos usuarios mediante credenciales encriptadas para asegurar la privacidad y seguridad.

#### Scenario: Alta de usuario exitosa
- **WHEN** el usuario envía un POST a `/registro` con `username` y `password` textual.
- **THEN** el sistema almacena el usuario con una contraseña hasheada (`password_hash`) y devuelve el ID generado.

### Requirement: Inicio de Sesión
El sistema MUST proporcionar autenticación mediante el intercambio de credenciales por un JWT u otro token de autorización.

#### Scenario: Autenticación correcta
- **WHEN** el usuario envía POST a `/login` con credenciales válidas.
- **THEN** el sistema verifica el hash y proporciona acceso autenticado.
