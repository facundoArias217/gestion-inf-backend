# Informe de ejecución — Tarjeta 9.4 [BE] Conversión de presupuesto en venta

**Tarjeta:** 9.4 — Presupuestos: conversión en venta con reverificación de stock (backend)
**Tipo:** [BE] · **Fecha:** 08/10/2026 · **Repositorio:** gestion-inf-backend

## Alcance ejecutado

El flujo más complejo del sistema, como un único endpoint transaccional:

- **Endpoint:** `POST /presupuestos/:id/convertir` (ADMIN/VENDEDOR) → 201 `{ data: { venta, presupuesto } }`.
- **`presupuesto.service.convertir`** en una sola transacción: lock del presupuesto → validación de estado → armado de líneas (sueltos + componentes del armado, RN-ARM-05) → locks `FOR UPDATE` por producto distinto con verificación de stock **agregada** (RN-STK-03) → creación de la Venta COMPLETADA con `presupuestoId` (RFN-20) → líneas en `VentaDetalle` → descuento de stock → presupuesto CONVERTIDO.
- **Colección Postman:** request "Convertir" con 5 ejemplos (éxito + 409 × 3 + 404).
- **Skill:** RFN-21 documenta la semántica completa (fuente de precios según vigencia, líneas mixtas, conversión única).

## Reglas de negocio cubiertas

| Regla | Implementación |
| --- | --- |
| RN-PRE-03 | Presupuesto **vencido** (ACEPTADO con `fechaVencimiento < hoy`): convierte con **recotización** — los precios de la venta son los de lista actuales; el presupuesto conserva sus históricos (RN-PRE-05). |
| RN-PRE-04 | Conversión única: el estado se valida con lock dentro de la transacción; un CONVERTIDO vuelve a intentar → 409. |
| RN-PRE-05 | Presupuesto **vigente**: la venta toma los precios históricos del detalle y de los componentes del armado; el presupuesto no se modifica retroactivamente. |
| RN-ARM-05 | Los componentes del armado se convierten en líneas de la venta (no se duplican como sueltos); no se copian a `PresupuestoDetalle`. |
| RN-STK-01/03 | Reverificación de stock en la transacción, agregando cantidades si un producto aparece en sueltos y en el armado; cualquier faltante → 409 con rollback total (ni venta ni estado). |
| RN-VTA-01 | La venta derivada nace COMPLETADA y descuenta stock en el mismo acto. |
| RFN-09 | Máquina de una dirección: si la venta se cancela después, el presupuesto permanece CONVERTIDO. |

## Decisiones tomadas

1. **Mensaje único de estado:** `Solo se puede convertir un presupuesto ACEPTADO` para PENDIENTE, RECHAZADO y CONVERTIDO (el FE ya conoce el estado; espejar este mensaje en el mock de la 9.2).
2. **Líneas sin merge:** si un producto aparece como suelto y como componente del armado, la venta lleva dos líneas (precios distintos posibles), pero el chequeo de stock suma ambas cantidades contra el lock del producto.
3. **`hoy()` en UTC ISO** (`YYYY-MM-DD`), misma convención que el FE para el vencimiento computado (RFN-16).

## Verificación

Batería **22/22 pruebas OK** contra la API real (datos de prueba eliminados y stock/precios restaurados tras la corrida):

- Crear presupuesto con armado FINALIZADO + suelto → aceptar → convertir → 201: venta con `presupuestoId`, 8 líneas (7 del armado + 1 suelto), precios históricos, stock descontado, presupuesto CONVERTIDO.
- Re-convertir → 409 · convertir un PENDIENTE sembrado → 409 · id inexistente → 404.
- **Vencido recotiza:** presupuesto con vencimiento pasado + precio de lista modificado a 99999 antes de convertir → la línea de la venta toma 99999 (recálculo, RN-PRE-03) y el detalle del presupuesto conserva 42000 (RN-PRE-05); precio restaurado luego.
- **Rollback ante stock insuficiente:** presupuesto con producto sin stock → convertir → 409 y verificación de que NO hay venta creada, el presupuesto sigue ACEPTADO y el stock quedó intacto.
- Cancelar la venta generada → stock reintegrado (RN-VTA-03), presupuesto permanece CONVERTIDO.

## Checklist manual pendiente

Con la 9.2/9.5: convertir desde el navegador un presupuesto aceptado con armado y verificar la venta en /ventas con sus líneas y el total derivado.
