# Informe de ejecución — Tarjeta 13.3 [BE] Duplicar armado

**Tarjeta:** 13.3 — Armados: duplicar como plantilla (BORRADOR con precios actuales)
**Tipo:** [BE] · **Fecha:** 09/10/2026 · **Repositorio:** gestion-inf-backend · **Rama:** `be/armados-duplicar`

## Alcance ejecutado

- **Endpoint:** `POST /armados/:id/duplicar` (ADMIN/VENDEDOR) → 201 con el armado duplicado.
- **`armado.service.duplicar`** delega en `crear`: el duplicado nace **BORRADOR** con nombre `«{original} (copia)»`, sin cliente, mismos componentes y cantidades, **precios de lista actuales** y las validaciones de la 8.3 aplicadas (stock suficiente por componente, productos existentes).
- **Postman:** request "Duplicar" en la carpeta Armados (201, 400, 404).

## Decisiones tomadas

1. **Sin flag de "plantilla":** el flujo «duplicar un FINALIZADO (o un BORRADOR en curso) como punto de partida» cubre el caso de uso sin ensuciar el modelo (decisión del plan aprobado).
2. **`clienteId = null` en la copia:** el armado es autónomo (RN-ARM-01) y la persona se asigna recién al presupuesto (RFN-11); una copia heredar al cliente sería una sugerencia no pedida.
3. Se puede duplicar desde **cualquier estado** (BORRADOR o FINALIZADO): el original es de solo lectura para este endpoint.

## Verificación

Batería **9/9 pruebas OK** contra la API real (copias eliminadas tras la corrida):

- Duplicar el FINALIZADO «PC Oficina Básica» → 201 **BORRADOR** «… (copia)», sin cliente, 6 componentes con precios actuales.
- El original permanece FINALIZADO e intacto.
- La copia es **editable** (PUT de BORRADOR → 200) y luego puede finalizar con el flujo normal de la 8.x.
- Duplicar un BORRADOR también → 201 · inexistente → 404 · cleanup: base restaurada (6 armados).

## Checklist manual pendiente

Con la 13.5 integrada: duplicar un FINALIZADO desde el navegador y editar la copia desde `/armados/:id/editar`.
