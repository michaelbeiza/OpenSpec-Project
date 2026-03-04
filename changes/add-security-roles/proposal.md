# Proposal: Add Security Roles

## Motivation
Actualmente el sistema no distingue roles administrativos, lo que permite a cualquier cuenta registrada realizar acciones críticas (como listar usuarios o posiblemente borrarlos). Es necesario introducir seguridad estricta basada en roles (RBAC) para proteger las endpoints de gestión de usuarios.

## Proposed Changes
1. **Roles en el Modelo `Usuario`**:
   - Añadir el campo `rol` al esquema `Usuario` en `specs/api.yaml`.
   - Tipo: `string`, Enum: `['admin', 'user']`.
   - Valor por defecto: `'user'`.
2. **Nivel de Acceso y Endpoints Administrativos**:
   - Añadir la ruta `DELETE /usuarios/{id}` para permitir la eliminación de cuentas.
   - Restringir la ruta `GET /users` (Listar usuarios) y `DELETE /usuarios/{id}` (Borrar usuarios) para que requieran de forma explícita el rol de `admin`.
   - Documentar en dichas rutas los códigos de error `403 Forbidden` y `401 Unauthorized` pertinentes.
