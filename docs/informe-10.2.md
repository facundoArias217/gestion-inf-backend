# Informe de ejecución — Tarjeta 10.2 [BE] Pagos

**Tarjeta:** 10.2 — Pagos: registro de pago simulado (backend)
**Tipo:** [BE] · **Fecha:** 08/10/2026 · **Repositorio:** gestion-inf-backend

## Alcance ejecutado

El circuito de cobro interno, obligatorio para el MVP:

- **Migración** `create-pagos` (ventaId FK, medioPago ENUM, monto DECIMAL(10,2), resultado ENUM, fecha DATEONLY) + modelo + asociaciones (Venta hasMany Pago — cardinalidad 1—N, RFN-17).
- **Endpoints:** `GET /pagos` (con filtro opcional `?ventaId=`) · `POST /pagos { ventaId, medioPago, monto, resultado, fecha }` → 201.
- **Roles:** ADMIN y VENDEDOR (el cobro es tarea del vendedor; el admin hereda).
- **Validator:** enums estrictos por RFN-18; monto positivo; fecha YYYY-MM-DD; el filtro del GET valida `ventaId` numérico (400 si no).
- **Seeder:** 4 pagos sobre ventas sembradas, incluyendo el par RECHAZADO → reintento APROBADO sobre la misma venta (exhibe la 1—N).
- **Colección Postman:** carpeta "Pagos" (Listar con filtro, Crear) con ejemplos de éxitos y errores.

## Reglas de negocio cubiertas

| Regla | Implementación |
| --- | --- |
| RN-PAG-01 | Pago separado de Venta: crear un pago no altera el estado de la venta ni su detalle. |
| RN-PAG-02 | Registra medio, monto y resultado sin servicios externos (enums definitivos de RFN-18). |
| RN-PAG-03 | El service no importa Producto ni ejecuta ningún cambio de stock; **verificado con comparación completa de stocks antes/después** en la batería. |
| RN-PAG-04 | Sin integración externa: Mercado Pago sigue siendo extensión opcional. |
| RFN-17 | 1—N: RECHAZADO + reintento APROBADO sobre la misma venta, ambos 201. |
| RFN-18 | Medios EFECTIVO/TRANSFERENCIA/TARJETA · resultados APROBADO/RECHAZADO · solo ventas COMPLETADA (409 sobre CANCELADA). |

## Verificación

Batería **16/16 pruebas OK** contra la API real (pagos de prueba eliminados tras la corrida):

- GET sin token 401 · GET 200 con los 4 sembrados (el par de la venta 2 muestra la 1—N) · filtro `?ventaId=2` → solo sus pagos · filtro inválido → 400.
- Pago sobre venta COMPLETADA → 201 · **stock de los 39 productos idéntico antes y después del pago (RN-PAG-03)** · venta CANCELADA → 409 · venta inexistente → 400.
- Medio inválido, resultado inválido y monto ≤ 0 → 400 (RFN-18).
- RECHAZADO → 201 y reintento APROBADO sobre la misma venta → 201 (RFN-17) · ADMIN hereda → 201.

## Decisiones tomadas

1. **RFN-18 cierra el ítem pendiente del BRD** (medios/estados definitivos): documentada en la skill en este mismo commit.
2. **La validación de "venta cobrable"** (COMPLETADA) es una regla de negocio del service (409), no del validator (no depende solo de la forma del dato).
3. El GET filtra por `ventaId` con un validator propio de query (`stripUnknown`), para no aceptar basura silenciosamente.

## Checklist manual pendiente

Con la 10.1/10.3: registrar un cobro desde el navegador sobre una venta COMPLETADA y verlo en el listado de pagos.
