# Informe de ejecución — Tarjeta 11.2 [BE] Usuarios

**Tarjeta:** 11.2 — Usuarios: gestión y roles (backend)
**Tipo:** [BE] · **Fecha:** 08/10/2026 · **Repositorio:** gestion-inf-backend

## Alcance ejecutado

- **Endpoints** (ADMIN only, RN-USR-02): `GET /usuarios` · `POST /usuarios` (hash bcrypt, nace activo) · `PUT /usuarios/:id` (password opcional: solo se cambia la clave si viene) · `PATCH /usuarios/:id/estado { activo }` (baja lógica idempotente, RFN-01/02).
- **Validator:** email normalizado a minúsculas y validado, password min 8 (solo requerida en el alta), rol ADMIN|VENDEDOR (RN-USR-01).
- **Service:** unicidad de email **case-insensitive** (409, mismo patrón de RFN-03 de categorías, excluyendo al propio en la edición); **guard de auto-baja**: un usuario no puede desactivarse a sí mismo (409).
- **Serializer:** `activo`, `createdAt` y `updatedAt` sumados al DTO de usuario (campos aditivos; `passwordHash` sigue fuera). `/auth/me` queda igualmente enriquecido.
- **Seeder:** usuario extra `Sofía Torres` (VENDEDOR, **inactivo**) para que el Histórico del listado tenga contenido.
- **Colección Postman:** carpeta "Usuarios" (Listar, Crear, Actualizar, Cambiar estado) con ejemplos de éxitos y errores.

## Reglas de negocio cubiertas

| Regla | Implementación |
| --- | --- |
| RF-USR-01 | Gestión completa de usuarios y roles (validada por ADMIN). |
| RN-USR-01 | Solo ADMIN/VENDEDOR en el enum del validator. |
| RN-USR-02 | Rutas completas ADMIN-only (403 para VENDEDOR, verificado). |
| RN-PRO-02 / RFN-01 | Baja lógica vía `activo = false`; sin borrado físico. |
| RFN-02 | El desactivado pasa al Histórico y puede reactivarse (PATCH idempotente). |

## Decisiones tomadas

1. **Guard de auto-baja (decidida en la corrida):** `No podés desactivar tu propio usuario` (409). Cambiarse el propio rol o la propia clave sigue permitido (no hay regla del BRD que lo prohíba).
2. **Email normalizado a minúsculas** en el alta y la edición (el login ya comparaba en minúsculas); unicidad global case-insensitive incluye a inactivos.
3. **Password opcional en la edición:** sin el campo, la clave no se toca (verificado con login posterior); con el campo, se re-hashea.

## Verificación

Batería **18/18 pruebas OK** contra la API real (usuario de prueba eliminado tras la corrida):

- GET sin token 401 · GET con VENDEDOR 403 · GET con ADMIN 200 (3 usuarios, sin `passwordHash`, con `activo`).
- Crear → 201 activo con email normalizado · duplicado case-insensitive → 409 · rol inválido → 400 · password corta → 400.
- Actualizar sin password → 200 y **el login sigue con la clave original** · actualizar con password → 200 y **el login pasa a la clave nueva**.
- Desactivar → 200 y **login bloqueado (activo=false)** · auto-baja → 409 · reactivar → 200 (idempotente) · inexistente → 404.

## Checklist manual pendiente

Con la 11.1/11.3: crear un usuario desde el navegador, desactivarlo, verlo en el Histórico y reactivarlo.
