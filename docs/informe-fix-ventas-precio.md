# Informe de ejecución — Fix RFN-10: precio de las ventas computado por el backend

**Fix:** redefinición de RFN-10 — el `precioUnitario` de las ventas lo computa el backend
**Tipo:** fix de contrato [BE] + [FE] · **Fecha:** 08/10/2026 · **Repositorios:** gestion-inf-backend (este) + gestion-inf-frontend (rama `fe/ventas-precio`)

## Problema

La skill documentaba RFN-10 como «el FE envía solo `{ productoId, cantidad }`; el BE toma el precio de lista (compras, ventas, armados y presupuestos)», pero el código real de **compras y ventas** hacía lo contrario: el FE enviaba un `precioUnitario` editable por el vendedor (campo de formulario) y el BE lo exigía en el validator y lo persistía tal cual. Solo armados cumplía la regla. Además del desvío documentado, un precio client-side en las ventas era un riesgo de integridad (el cliente HTTP controlaba el valor facturado).

## Alcance ejecutado

- **Validator** (`venta.validator.js`): `detalleSchema` sin `precioUnitario` (solo `productoId` + `cantidad`). Joi con `allowUnknown: false` por defecto rechaza la clave vieja con 400 `"precioUnitario" is not allowed` — contrato estricto: un cliente desactualizado falla ruidoso, no silencioso.
- **Service** (`venta.service.js`): el precio se toma de `producto.precio` (precio de lista) con lock `FOR UPDATE` dentro de la transacción y se persiste como histórico — mismo patrón que `armado.service.js` (8.3).
- **Postman** (`docs/postman/collection.json`): body del request "Crear" de Ventas sin `precioUnitario` (request + 5 `originalRequest` de los ejemplos de error). Las respuestas de ejemplo mantienen el `precioUnitario` en `detalles` (ahora computado por el server).
- **Skill** (`skills/reglas-de-negocio/SKILL.md`): RFN-10 redefinida — **ventas y armados** computan el BE desde precio de lista; **compras** envían el costo del proveedor (dato de negocio no derivable del catálogo); en la conversión 9.4 el histórico será el del detalle del presupuesto (RN-PRE-05), no el de lista.
- **Frontend** (rama `fe/ventas-precio` del otro repo): se quita el input de precio de la página de registro; el mock computa el precio desde el producto.

## Verificación

Batería **12/12 PASS** contra la API real (DB con seeds, datos de prueba eliminados tras la corrida):

- Login admin OK · crear venta sin `precioUnitario` → 201 con `precioUnitario` persistido = precio de lista (305000) · stock descontado en 1.
- Producto inexistente → 400 con mensaje · stock insuficiente → 409.
- Enviar `precioUnitario` desde el cliente → **400** con error explícito (contrato estricto).
- Cancelar → 200 y stock reintegrado · re-cancelar una CANCELADA → 409 (máquina de una dirección, RFN-09).

## Decisiones

1. **Rechazar en vez de ignorar:** se mantuvo el `allowUnknown: false` por defecto de Joi; el contrato queda estricto y consistente con armados.
2. **Compras no se tocan:** el costo del proveedor es un dato de negocio que el catálogo no puede derivar; la regla se corrigió en la skill, no en el código.
3. Los seeds de ventas no se modifican: sus `precioUnitario` son datos históricos válidos.

## Checklist manual pendiente

Con ambos servers levantados: registrar una venta desde el navegador y verificar que el precio de cada fila es el de lista (solo lectura), que el subtotal se calcula en vivo y que el detalle creado coincide con el catálogo.
