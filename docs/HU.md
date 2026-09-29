# Historias de Usuario

Fuente de verdad: `docs/brd.md`. Agrupadas por los mismos módulos y numeración de `docs/tarjetas.md`, para cruzar HU ↔ tarjeta. Roles del alcance: **Administrador** y **Vendedor** (el cliente no es usuario del sistema; no existe e-commerce).

## Módulo 0 — Transversal

Sin HU: setup de estilos, cliente HTTP y colección Postman no representan historias de usuario del negocio.

## Módulo 1 — Auth

### HU-1.1 — Iniciar sesión

COMO Administrador/Vendedor
QUIERO iniciar sesión con mis credenciales
PARA acceder al sistema

→ RF-AUT-01, RF-AUT-02 · RN-USR-01 · Tarjeta 1.1

## Módulo 2 — Categorías

### HU-2.1 — Gestionar categorías

COMO Administrador
QUIERO registrar, modificar y dar de baja categorías
PARA clasificar los productos

→ RF-PRO-02 · Tarjeta 2.1

## Módulo 3 — Productos

### HU-3.1 — Gestionar productos

COMO Administrador
QUIERO registrar, modificar y dar de baja (lógicamente) productos
PARA mantener actualizado el catálogo y preservar la trazabilidad

→ RF-PRO-01, RF-PRO-03 · RN-PRO-01, RN-PRO-03 · Tarjeta 3.1

## Módulo 4 — Clientes

### HU-4.1 — Gestionar clientes

COMO Vendedor
QUIERO gestionar clientes
PARA asociarlos a presupuestos y ventas

→ RF-CLI-01 · RN-PRO-02 · Tarjeta 4.1

## Módulo 5 — Proveedores

### HU-5.1 — Gestionar proveedores

COMO Administrador
QUIERO gestionar proveedores
PARA registrar compras

→ RF-PROV-01 · RN-PRO-02 · Tarjeta 5.1

## Módulo 6 — Compras

### HU-6.1 — Registrar compra

COMO Administrador
QUIERO registrar una compra con proveedor y detalle
PARA registrar la reposición de stock

→ RF-COM-01 · RN-COM-01 · Tarjeta 6.1

### HU-6.2 — Confirmar compra

COMO Administrador
QUIERO confirmar una compra pendiente
PARA incrementar stock

→ RF-COM-02 · RN-COM-02, RN-STK-02 · Tarjeta 6.2

### HU-6.3 — Cancelar compra

COMO Administrador
QUIERO cancelar una compra pendiente
PARA anularla sin afectar stock

→ RF-COM-03 · RN-COM-03 · Tarjeta 6.2

## Módulo 7 — Ventas

### HU-7.1 — Registrar venta

COMO Vendedor
QUIERO registrar una venta con detalle
PARA concretar la operación

→ RF-VTA-01, RF-VTA-02 · RN-VTA-01, RN-VTA-02, RN-STK-03 · Tarjeta 7.1

### HU-7.2 — Descuento de stock

COMO Vendedor
QUIERO que el stock se descunte al completar una venta
PARA mantener la disponibilidad actualizada

→ RF-VTA-02 · RN-VTA-02 · Tarjeta 7.2

### HU-7.3 — Cancelar venta

COMO Vendedor
QUIERO cancelar una venta
PARA revertir su efecto sobre el stock

→ RF-VTA-03 · RN-VTA-03 · Tarjeta 7.1

## Módulo 8 — Armados

### HU-8.1 — Configurar armado

COMO Vendedor
QUIERO configurar un armado de PC con componentes
PARA ofrecer una computadora armada

→ RF-ARM-01 · RN-ARM-01, RN-ARM-04 · Tarjeta 8.1

### HU-8.2 — Validar armado

COMO Vendedor
QUIERO validar completitud, stock y advertencias de incompatibilidad del armado
PARA garantizar que sea viable sin impedir su venta

→ RF-ARM-02 · RN-ARM-02, RN-ARM-03 · Tarjeta 8.2

## Módulo 9 — Presupuestos

### HU-9.1 — Crear presupuesto

COMO Vendedor
QUIERO crear un presupuesto para un cliente
PARA cotizar antes de vender

→ RF-PRE-01 · RN-PRE-01, RN-PRE-02 · Tarjeta 9.1

### HU-9.2 — Gestionar estados del presupuesto

COMO Vendedor
QUIERO gestionar estados y vencimiento del presupuesto
PARA conocer su situación

→ RF-PRE-02 · RN-PRE-02, RN-PRE-06 · Tarjeta 9.1

### HU-9.3 — Convertir presupuesto en venta

COMO Vendedor
QUIERO convertir un presupuesto en venta
PARA concretar una operación aceptada

→ RF-PRE-03 · RN-PRE-03, RN-PRE-04, RN-PRE-05 · Tarjeta 9.2

## Módulo 10 — Pagos

### HU-10.1 — Registrar cobro

COMO Vendedor
QUIERO registrar el cobro mediante pago simulado
PARA cerrar internamente el circuito comercial

→ RF-PAG-01, RF-PAG-02 · RN-PAG-01, RN-PAG-02 · Tarjeta 10.1

### HU-10.2 — Registrar resultado del cobro

COMO Vendedor
QUIERO registrar el resultado del cobro
PARA conocer el resultado de cada cobro

→ RF-PAG-02 · RN-PAG-02, RN-PAG-03 · Tarjeta 10.1

## Módulo 11 — Usuarios

### HU-11.1 — Gestionar usuarios

COMO Administrador
QUIERO gestionar usuarios y roles
PARA controlar el acceso al sistema

→ RF-USR-01 · RN-USR-01, RN-USR-02, RN-USR-03, RN-USR-04 · Tarjeta 11.1

## Módulo 12 — Dashboard

### HU-12.1 — Visualizar dashboard

COMO Administrador
QUIERO visualizar el dashboard operativo
PARA monitorear la actividad

→ RF-DSH-01 · Tarjeta 12.1

---

## Cobertura de requerimientos funcionales

Todos los RF del BRD quedan cubiertos (22 de 22): RF-AUT-01/02, RF-PRO-01/02/03, RF-CLI-01, RF-PROV-01, RF-COM-01/02/03, RF-VTA-01/02/03, RF-PRE-01/02/03, RF-ARM-01/02, RF-PAG-01/02, RF-USR-01, RF-DSH-01.

Nota: las 21 HU del BRD quedan representadas en 20 historias: HU-PRO-01 y HU-PRO-03 del BRD (alta/modificación y baja lógica de productos) se fusionan en HU-3.1 porque corresponden a la misma pantalla y tarjeta.
