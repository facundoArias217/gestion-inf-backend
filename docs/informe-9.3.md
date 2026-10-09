# Informe de ejecución — Tarjeta 9.3 [BE] Presupuestos

**Tarjeta:** 9.3 — Presupuestos: creación, estados y vencimiento (backend)
**Tipo:** [BE] · **Fecha:** 08/10/2026 · **Repositorio:** gestion-inf-backend

## Alcance ejecutado

Backend del segundo diferenciador, cubriendo el contrato anticipado por el frontend en la 9.1:

- **Migraciones:** `create-presupuestos` (encabezado con `clienteId`, `usuarioId`, `armadoId` nullable, `fecha`, `fechaVencimiento`, estado ENUM) + `create-presupuesto-detalles` (`precioUnitario` histórico) + `add-presupuestoId-to-ventas` (FK nullable con constraint unique — RFN-20).
- **Modelos + asociaciones:** `Presupuesto` y `PresupuestoDetalle` registrados en `models/index.js` (`belongsTo` Cliente/Usuario/Armado, `hasMany` detalles, `hasOne` Venta); `Venta` incorpora `presupuestoId`.
- **Endpoints:** `GET /presupuestos` (detalles embebidos) · `POST /presupuestos` (nace PENDIENTE) · `PATCH /presupuestos/:id/estado { estado: ACEPTADO | RECHAZADO }`.
- **Roles:** ADMIN y VENDEDOR en todo el módulo (RN-USR-02/03).
- **Seeder:** los 8 presupuestos del mock del frontend (mismos ids, estados, armados y cotizaciones históricas); el CONVERTIDO (id 7) queda linkeado a la venta sembrada 7 vía `presupuestoId` (coherencia del 1:1).
- **Colección Postman:** carpeta "Presupuestos" (Listar, Crear, Cambiar estado) con ejemplos de éxitos y errores.

## Reglas de negocio cubiertas

| Regla | Implementación |
| --- | --- |
| RN-PRE-01 | `clienteId` requerido y validado; `usuarioId` = usuario autenticado (fuera del DTO). |
| RN-PRE-02 | `fechaVencimiento` obligatoria, formato YYYY-MM-DD, y no puede ser anterior a `fecha` (400 si lo es). |
| RN-PRE-06 | Máquina de una dirección: solo PENDIENTE se acepta/rechaza (409 en otro estado); CONVERTIDO no es seteable por `PATCH` — llega únicamente por la conversión (9.4). |
| RN-ARM-04 | `armadoId` validado: solo un armado FINALIZADO se asocia (409 con el mensaje espejo del mock). |
| RFN-15 | Al menos un armado o un detalle (400 con el mensaje espejo del mock). |
| RFN-14/RN-ARM-03 | El stock **no se valida** al cotizar (advertencia informativa del FE); la verificación dura ocurre en la conversión (9.4, RN-STK-03). |
| RFN-16 | VENCIDO sigue computado en el render del FE; el BE no persiste ni calcula VENCIDO. |
| RFN-10 | El precio del detalle lo computa el backend desde `producto.precio` (precio de lista) dentro de la transacción y lo persiste como histórico; el FE envía solo `{ productoId, cantidad }` (contrato estricto: precio del cliente → 400). |
| RFN-19/20 | Nuevas reglas documentadas en la skill: armado reutilizable entre presupuestos (sin FK unique) y Presupuesto↔Venta 1:1. |

## Decisiones tomadas

1. **`armadoId` sin unique (RFN-19):** el mock de la 9.1 reusa el armado 2 en los presupuestos 3 y 7; la unicidad de conversión la garantiza el estado (RN-PRE-04) y el stock se re-verifica siempre al convertir, así que cotizar el mismo armado varias veces no rompe nada.
2. **`fechaVencimiento >= fecha`** se valida en el service (regla de consistencia de datos, 400).
3. **Seed del CONVERTIDO linkeado a venta sembrada:** la venta 7 (clienteId 4, igual que el presupuesto 7) recibe `presupuestoId = 7` — la historia queda coherente: presupuesto convertido y venta luego cancelada.

## Verificación

Batería **16/16 pruebas OK** contra la API real (DB con seeds, datos de prueba eliminados tras la corrida):

- GET sin token 401 · GET con VENDEDOR 200 (8 presupuestos sembrados, detalles embebidos, `usuarioId` fuera del DTO).
- POST con armado FINALIZADO + sueltos → 201 PENDIENTE con precio computado = precio de lista · POST solo armado → 201 · POST con armado BORRADOR → 409 · sin armado ni detalles → 400 · cliente inexistente → 400 · vencimiento anterior a la fecha → 400 · `precioUnitario` del cliente → 400 (contrato estricto).
- PATCH aceptar → 200 ACEPTADO · re-aceptar → 409 · estado CONVERTIDO → 400 · id inexistente → 404 · PATCH con ADMIN → 200 (hereda).

## Problemas encontrados y soluciones

- Ninguno nuevo: los patrones de ventas (precio computado, transacción, locks) se replicaron sin desvíos.

## Checklist manual pendiente

Con la 9.2/9.5 integradas: crear un presupuesto con armado + suelto desde el navegador, aceptarlo y verificar estados y vencimiento computado en el listado.
