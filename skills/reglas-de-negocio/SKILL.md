---
name: reglas-de-negocio
description: Reglas de negocio del sistema (stock, compras, ventas, presupuestos, armados, pagos, usuarios). Consultar al implementar Services, validators o cualquier operación que modifique stock, precios o estados. Fuente de verdad: docs/brd.md.
---

# Reglas de Negocio

Fuente de verdad: `docs/brd.md` (v1.1). Complemento de validaciones: `docs/modelo-datos-analisis-v1.md`. Estas reglas son no negociables: cualquier implementación en `services/` o `validators/` debe respetarlas.

---

## Stock

### RN-STK-01

- **Qué valida:** que el producto tenga stock suficiente antes de venderse o incluirse en un armado.
- **Cuándo aplica:** al registrar una venta, al validar un armado y al convertir un presupuesto en venta.
- **Entidad/módulo:** `Producto` (`stock`), servicios de `venta`, `armado`, `presupuesto`.
- **Implementación:** verificar en el service antes de persistir; si no alcanza, rechazar la operación con error de negocio.

### RN-STK-02

- **Qué valida:** que una compra confirmada incremente stock y una venta completada lo desconte.
- **Cuándo aplica:** en la transición de estados de cada operación, nunca antes.
- **Entidad/módulo:** `Compra`, `Venta`, `CompraDetalle`, `VentaDetalle`, servicios de `compra` y `venta`.

### RN-STK-03

- **Qué valida:** que el stock se verifique nuevamente al confirmar la venta, porque pudo cambiar desde la cotización.
- **Cuándo aplica:** al convertir presupuesto → venta y al confirmar cualquier venta.
- **Entidad/módulo:** `Venta`, `Presupuesto`, servicio de `venta`.
- **Implementación:** reverificar stock dentro de la transacción de confirmación, no confiar en datos del presupuesto.

---

## Compras

### RN-COM-01

- **Qué valida:** que una compra PENDIENTE no modifique stock.
- **Cuándo aplica:** al registrar una compra (nace PENDIENTE) y en cualquier momento previo a su confirmación.
- **Entidad/módulo:** `Compra`, servicio de `compra`.

### RN-COM-02

- **Qué valida:** que el stock aumente únicamente al pasar de PENDIENTE a COMPLETADA, según las cantidades del detalle.
- **Cuándo aplica:** solo en la operación de confirmación.
- **Entidad/módulo:** `Compra`, `CompraDetalle`, servicio de `compra`.
- **Implementación:** incrementar stock dentro de una transacción que cambie el estado; validar que el estado previo sea PENDIENTE.

### RN-COM-03

- **Qué valida:** que una compra CANCELADA no modifique stock.
- **Cuándo aplica:** al cancelar una compra (solo si está PENDIENTE).
- **Entidad/módulo:** `Compra`, servicio de `compra`.

---

## Ventas

### RN-VTA-01

- **Qué valida:** que una venta se cree directamente COMPLETADA y desconte stock en el mismo acto.
- **Cuándo aplica:** al registrar una venta directa o al convertir un presupuesto en venta.
- **Entidad/módulo:** `Venta`, servicio de `venta`.
- **Implementación:** creación + descuento de stock dentro de la misma transacción.

### RN-VTA-02

- **Qué valida:** que una venta completada desconte las cantidades de su detalle (`VentaDetalle`).
- **Cuándo aplica:** al completar la venta, por cada ítem del detalle.
- **Entidad/módulo:** `Venta`, `VentaDetalle`, `Producto`, servicio de `venta`.

### RN-VTA-03

- **Qué valida:** que cancelar una venta revierta el descuento de stock de forma transaccional.
- **Cuándo aplica:** al cancelar una venta COMPLETADA.
- **Entidad/módulo:** `Venta`, `VentaDetalle`, `Producto`, servicio de `venta`.
- **Implementación:** devolver las cantidades del detalle y cambiar el estado en una sola transacción; si algo falla, revertir todo.

---

## Presupuestos

### RN-PRE-01

- **Qué valida:** que un presupuesto pertenezca a un cliente y sea generado por un vendedor.
- **Cuándo aplica:** al crear un presupuesto.
- **Entidad/módulo:** `Presupuesto`, `Cliente`, `Usuario` (rol Vendedor), servicio de `presupuesto`.

### RN-PRE-02

- **Qué valida:** que un presupuesto posea fecha de vencimiento (`fechaVencimiento`).
- **Cuándo aplica:** al crear el presupuesto; el vencimiento se evalúa al intentar convertir.
- **Entidad/módulo:** `Presupuesto`, servicio de `presupuesto`.
- **Detalle:** la cantidad exacta de días de vencimiento está pendiente de definición (ver "Reglas pendientes").

### RN-PRE-03

- **Qué valida:** que un presupuesto vencido no pueda convertirse directamente sin recalcular precios y verificar stock.
- **Cuándo aplica:** al intentar convertir un presupuesto cuyo vencimiento expiró.
- **Entidad/módulo:** `Presupuesto`, `PresupuestoDetalle`, servicios de `presupuesto` y `venta`.

### RN-PRE-04

- **Qué valida:** que un presupuesto pueda convertirse como máximo una vez.
- **Cuándo aplica:** al intentar convertir; si ya está CONVERTIDO, rechazar.
- **Entidad/módulo:** `Presupuesto`, servicio de `venta`.
- **Implementación:** controlar el estado actual dentro de la transacción de conversión.

### RN-PRE-05

- **Qué valida:** que la conversión no modifique retroactivamente los precios históricos del presupuesto.
- **Cuándo aplica:** al convertir; la venta debe tomar precios del detalle del presupuesto tal como fueron cotizados.
- **Entidad/módulo:** `Presupuesto`, `PresupuestoDetalle`, `Venta`, `VentaDetalle`.

### RN-PRE-06

- **Qué valida:** que ACEPTADO y CONVERTIDO representen momentos distintos de la máquina de estados.
- **Cuándo aplica:** en todo flujo de estados del presupuesto (PENDIENTE → ACEPTADO/RECHAZADO → CONVERTIDO, con VENCIDO como desvío).
- **Entidad/módulo:** `Presupuesto`, servicio de `presupuesto`.

---

## Armados

### RN-ARM-01

- **Qué valida:** que un armado sea autónomo y pueda existir antes de asociarse a un presupuesto.
- **Cuándo aplica:** al modelar y al crear armados; no acoplar el armado a `PresupuestoDetalle`.
- **Entidad/módulo:** `Armado`, `Presupuesto`, `ArmadoComponente`.

### RN-ARM-02

- **Qué valida:** que el sistema advierta posibles incompatibilidades entre componentes, sin impedir su selección o venta.
- **Cuándo aplica:** al configurar/armar una PC; la advertencia es informativa y no bloqueante.
- **Entidad/módulo:** `Armado`, `ArmadoComponente`, servicio de `armado`.
- **Implementación:** devolver advertencias junto a la validación de completitud; nunca rechazar la venta por incompatibilidad. La compatibilidad técnica avanzada (sockets, chipsets, wattage) está fuera de alcance.

### RN-ARM-03

- **Qué valida:** que la disponibilidad de componentes pueda verificarse al cotizar y debe verificarse al confirmar la venta.
- **Cuándo aplica:** dos chequeos: informativo al crear el presupuesto, obligatorio al confirmar la venta.
- **Entidad/módulo:** `Armado`, `ArmadoComponente`, `Producto`, servicios de `presupuesto` y `venta`.

### RN-ARM-04

- **Qué valida:** que solo un armado FINALIZADO pueda asociarse a un presupuesto.
- **Cuándo aplica:** al agregar un armado a un presupuesto.
- **Entidad/módulo:** `Armado` (estado FINALIZADO), `Presupuesto`, servicio de `presupuesto`.

### RN-ARM-05

- **Qué valida:** que los componentes del armado no se dupliquen en `PresupuestoDetalle`; la PC armada se referencia una sola vez.
- **Cuándo aplica:** al convertir un presupuesto con armado en venta.
- **Entidad/módulo:** `Armado`, `PresupuestoDetalle`, `VentaDetalle`, servicio de `venta`.
- **Implementación:** al generar la venta, descontar los componentes desde el armado, no duplicar sus ítems como líneas del detalle.

---

## Productos

### RN-PRO-01

- **Qué valida:** que un producto con movimientos asociados (compras, ventas o armados) se dé de baja lógicamente, no físicamente.
- **Cuándo aplica:** al intentar eliminar un producto.
- **Entidad/módulo:** `Producto` (`activo`), servicio de `producto`.
- **Implementación:** impedir `DELETE` físico; marcar `activo = false` (soft delete).

### RN-PRO-02

- **Qué valida:** que clientes, proveedores y usuarios se den de baja lógicamente cuando corresponda.
- **Cuándo aplica:** al eliminar cualquier registro con información histórica.
- **Entidad/módulo:** `Cliente`, `Proveedor`, `Usuario`, servicios correspondientes.

### RN-PRO-03

- **Qué valida:** que la marca sea texto en el MVP; Marca como entidad propia es una evolución.
- **Cuándo aplica:** al modelar el producto; no crear entidad `Marca` en el MVP.
- **Entidad/módulo:** `Producto` (`marca` como string).

---

## Pagos

### RN-PAG-01

- **Qué valida:** que Venta y Pago se mantengan separados conceptualmente.
- **Cuándo aplica:** al modelar y registrar cobros; el Pago representa el intento/resultado de cobrar una venta ya existente.
- **Entidad/módulo:** `Pago`, `Venta`, servicio de `pago`.

### RN-PAG-02

- **Qué valida:** que el pago simulado registre medio, monto y resultado sin servicios externos.
- **Cuándo aplica:** al registrar el cobro (funcionalidad obligatoria del MVP).
- **Entidad/módulo:** `Pago`, servicio de `pago`.
- **Detalle:** medios de pago simulados y estados definitivos están pendientes de definición.

### RN-PAG-03

- **Qué valida:** que el pago no modifique ni reserve stock.
- **Cuándo aplica:** en todo flujo de pagos; el descuento de stock pertenece exclusivamente a la venta.
- **Entidad/módulo:** `Pago`, `Producto`, servicio de `pago`.

### RN-PAG-04

- **Qué valida:** que Mercado Pago sea una extensión opcional y no altere el núcleo de Venta/Stock.
- **Cuándo aplica:** solo si se decide implementar la extensión; no introducir integraciones externas de pago en el MVP.
- **Entidad/módulo:** `Pago`, servicio de `pago`.

---

## Usuarios

### RN-USR-01

- **Qué valida:** que existan exactamente dos roles: Administrador y Vendedor.
- **Cuándo aplica:** al modelar usuarios y al autorizar operaciones.
- **Entidad/módulo:** `Usuario` (rol), `middlewares/auth.middleware.js`.

### RN-USR-02

- **Qué valida:** que el Administrador gestione catálogo, proveedores, compras, usuarios y dashboard, y pueda realizar tareas del Vendedor.
- **Cuándo aplica:** al autorizar rutas y operaciones.
- **Entidad/módulo:** rutas de `producto`, `categoria`, `proveedor`, `compra`, `usuario`, `dashboard` (permitir ADMIN y VENDEDOR donde corresponda según RN-USR-03).

### RN-USR-03

- **Qué valida:** que el Vendedor gestione clientes, presupuestos, armados, conversiones y ventas.
- **Cuándo aplica:** al autorizar rutas y operaciones.
- **Entidad/módulo:** rutas de `cliente`, `presupuesto`, `armado`, `venta`, `pago`.

### RN-USR-04

- **Qué valida:** que el cliente no sea usuario del sistema y que no exista un rol independiente de stock.
- **Cuándo aplica:** al modelar autenticación/autorización; no crear roles ni accesos para clientes.
- **Entidad/módulo:** `Cliente`, `Usuario`, `middlewares/auth.middleware.js`.

---

## Reglas decididas en la implementación

Reglas funcionales decididas durante el desarrollo que **complementan** (sin contradecir) a las RN del BRD. Convención: toda regla que se decida durante una tarjeta se documenta acá en la misma corrida de la decisión, con la tarjeta de origen. Mismos IDs que la sección §4 del FRD-v1 (`docs` del Escritorio / informe del proyecto).

| ID | Regla | Tarjeta |
| --- | --- | --- |
| RFN-01 | **Bajas siempre lógicas:** no existe eliminación definitiva de registros en ningún módulo; la "baja" es siempre `activo = false`, sin endpoints de borrado físico. | 2.2 |
| RFN-02 | **Ciclo de vida con Histórico:** los registros desactivados pasan a la pestaña «Histórico» del listado, donde pueden reactivarse (`PATCH /:id/estado { activo }`, idempotente). | 2.2 |
| RFN-03 | **Unicidad global de nombre de categoría** (case-insensitive, incluye inactivas) → 409; la reactivación nunca colisiona. | 2.2 |
| RFN-04 | **Stock como atributo editable** del producto en alta y edición; no existe módulo de stock aparte. | 3.1 |
| RFN-05 | **Productos sin unicidad** de nombre+marca (mismo nombre con distinta marca es válido). | 3.1 |
| RFN-09 | **Máquinas de estados de una dirección:** compra (PENDIENTE → COMPLETADA/CANCELADA), venta (COMPLETADA → CANCELADA), armado (BORRADOR → FINALIZADO), presupuesto (PENDIENTE → ACEPTADO/RECHAZADO → CONVERTIDO). Sin transiciones hacia atrás; el target de estado se valida con enum en el validator. | 6.2/7.1/8.2/9.1 |
| RFN-10 | **precioUnitario de los detalles computado por el backend:** el FE envía solo `{ productoId, cantidad }`; el BE toma el precio de lista al crear y lo persiste como histórico (compras, ventas, armados y presupuestos). | 6.3/7.2/8.3 |
| RFN-11 | **Cliente opcional en el armado** (cierra la decisión pendiente §16.4 del modelo de datos): el armado es autónomo (RN-ARM-01) y la persona se asigna recién al presupuesto (RN-PRE-01). | 8.1 |
| RFN-12 | **Validación de CUIT/CUIL con dígito verificador AFIP** (pesos 5,4,3,2,7,6,5,4,3,2) sobre 11 dígitos sin guiones; clientes solo prefijos de persona física (20/23/24/27); proveedores aceptan además los de empresa (30/33/34). | 4.1/4.2/5.1/5.2 |
| RFN-13 | **Vencimiento de presupuestos por vigencia editable:** el FE ofrece presets (default **48 horas = +2 días**, 7/15/30 días o personalizada) y computa `fechaVencimiento` en vivo; el dato persistido y del contrato es la fecha, no la vigencia. El default es parámetro de UX: la decisión «X días» del BRD sigue pendiente. | 9.1 |
| RFN-14 | **Stock al cotizar un presupuesto: advertencia informativa, no bloqueante** (RN-ARM-03 «puede verificarse al cotizar»); el chequeo duro ocurre al convertir en venta (RN-STK-03). Permite cotizar reposición futura. | 9.1 |
| RFN-15 | **Un presupuesto puede incluir un armado FINALIZADO y productos sueltos a la vez** (al menos uno de los dos requerido); los componentes del armado no se duplican en el detalle (RN-ARM-05): el presupuesto referencia `armadoId` y el total del armado se suma al del detalle. | 9.1 |
| RFN-16 | **Estado VENCIDO del presupuesto computado, no persistido:** al renderizar, un presupuesto con `fechaVencimiento < hoy` y estado ∈ {PENDIENTE, ACEPTADO} se muestra VENCIDO; no hay acción que lo setee (la conversión de un vencido exige recálculo, RN-PRE-03 — tarjeta 9.2). | 9.1 |

## Reglas pendientes de definición

No implementar como definitivas sin una decisión explícita; marcar como pendientes:

- Medios de pago simulados y estados definitivos.
- Cantidad exacta de días para vencimiento de presupuestos.
- Cardinalidad definitiva Venta–Pago.
- Decisiones abiertas del modelo de datos.

Las reglas específicas de las extensiones opcionales (Kardex, Garantías, Envíos, Mercado Pago) se definirán únicamente si se implementa la extensión correspondiente.
