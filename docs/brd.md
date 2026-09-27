# Documentación de Requerimientos de Negocio

**Versión:** 1.1
**Fecha:** 15/09/2026
**Autor:** Arias, Facundo Roberto
**Release:** Septiembre 2026
**Estado:** Propuesta para revisión

**BRD | Sistema de Gestión para una Tienda de Productos Informáticos | v1.0**

---

## 1. Historial de Cambios

| Versión | Fecha | Autor | Descripción |
| --- | --- | --- | --- |
| v1.0 | 15/09/2026 | Arias, Facundo | Primera versión consolidada del BRD. Define el MVP obligatorio y mantiene las ampliaciones como extensiones opcionales. |

---

## 2. Alcance

### 2.1. Descripción del Proyecto / Objetivos

El sistema aborda la gestión de una tienda de productos informáticos, incluyendo catálogo, compras, ventas, presupuestos y configuración de armados de PC. Los dos procesos diferenciadores son **Presupuestos** y **Armado de PCs**. El sistema es utilizado internamente por el personal de la tienda en el contexto de un local físico; el cliente no accede al sistema ni realiza operaciones de autogestión

Objetivo general: gestionar de forma consistente las operaciones comerciales y el stock, incorporando un circuito interno de cobro mediante **pago simulado**.

- Gestionar productos y categorías.
- Registrar clientes y proveedores.
- Gestionar compras con actualización de stock al confirmarse.
- Gestionar ventas directas y derivadas de presupuestos, descontando stock.
- Elaborar presupuestos y convertirlos en ventas.
- Configurar armados de PC y validar completitud básica y disponibilidad.
- Registrar pagos simulados.
- Gestionar usuarios y roles.
- Proveer un dashboard operativo.

### 2.2. Justificación

- Centralizar la gestión del negocio.
- Permitir cotizaciones previas mediante presupuestos.
- Resolver la configuración de PCs mediante componentes.
- Mantener stock consistente con las operaciones comerciales.
- Conservar trazabilidad de precios y operaciones.
- Cerrar internamente el circuito de cobro mediante **pago simulado**.

### 2.3. Hipótesis

- El negocio ofrece, además de productos sueltos, **armados de PC** compuestos por múltiples componentes, que el vendedor configura durante la atención presencial al cliente.
- Un **presupuesto** puede ser evaluado antes de concretarse, por lo que stock y precios pueden variar.
- El cobro puede representarse inicialmente mediante un medio de pago interno/**simulado**.

### 2.4. Restricciones

- El cliente no es usuario del sistema y no existe **e-commerce público**.
- El stock se gestiona como atributo del producto, no como un CRUD independiente.
- Los registros con información histórica se dan de **baja lógicamente** cuando corresponde.
- Las operaciones que modifican stock deben ser **consistentes y transaccionales**.
- No se valida **compatibilidad avanzada de hardware** (sockets, chipsets, wattage).
- El desarrollo es individual y debe mantenerse en un alcance académico razonable.

### 2.5. Dependencias

- Modelo relacional para las entidades y relaciones del negocio.
- Base de datos **transaccional**.
- **Autenticación y autorización** por roles **Administrador/Vendedor**.
- Interfaz web para usuarios internos.

Los detalles técnicos se definen en la documentación de arquitectura y no forman parte de este BRD.

### 2.6. Alcance del Proyecto

#### 2.6.1. Alcance obligatorio / MVP

- **Autenticación** con roles **Administrador** y **Vendedor**.
- Gestión de productos y categorías.
- Gestión de clientes y proveedores.
- **Compras** con detalle e incremento de stock al confirmar.
- **Ventas** directas y derivadas de presupuestos, con descuento de stock.
- **Presupuestos** con estados, vencimiento y conversión única en venta.
- **Armado de PCs** con completitud básica y verificación de stock.
- **Pago simulado** interno.
- **Dashboard** operativo.

El armado de PC es una herramienta interna del vendedor para atención presencial, no un configurador de autoservicio para el cliente, por eso el **e-commerce queda fuera de alcance**. El **pago simulado es obligatorio**. Mercado Pago real es una **extensión opcional**.

#### 2.6.2. Fuera de alcance

- **E-commerce público** y autogestión de compras por parte del cliente.
- **Facturación real** e integración con **AFIP**.
- Integraciones externas de pago dentro del MVP.
- Conciliación bancaria y gestión financiera avanzada.
- Compatibilidad técnica avanzada.
- Generación de representaciones visuales o renders 3D de las PCs configuradas.
- Importación automática de catálogos.
- Múltiples sucursales.

#### 2.6.3. Evolución del sistema

- **Marca** como entidad propia.
- Métricas adicionales del dashboard.

#### 2.6.4. Extensiones opcionales — Propuestas de ampliación

| Nivel | Extensión | Alcance conceptual |
| --- | --- | --- |
| 1 — Baja | **Kardex / historial de movimientos** | Registrar y consultar movimientos de stock derivados de operaciones existentes. |
| 2 — Media | **Garantías y devoluciones** | Gestionar postventa, devoluciones, estados y reincorporación condicional al stock. |
| 3 — Media/Alta | **Envíos y logística** | Gestionar envíos, estados, datos de entrega, asignación y seguimiento básico. |
| 4 — Alta | **Integración con Mercado Pago** | Integrar un proveedor externo, estados de pago, identificadores y eventualmente webhooks. |

Las extensiones son **opcionales** y su ausencia no implica incumplimiento del alcance. Los nodos o puntos de distribución, si se incorporaran, serían una decisión futura dentro de la extensión logística.

---

## 3. Requerimientos de Negocio

### 3.1. Reglas de Negocio

| Dominio | ID | Regla |
| --- | --- | --- |
| Stock | **RN-STK-01** | No se puede vender ni incluir en un armado un producto sin stock suficiente. |
| Stock | **RN-STK-02** | Una compra confirmada incrementa stock y una venta completada lo descuenta. |
| Stock | **RN-STK-03** | El stock debe verificarse nuevamente al confirmar la venta, porque puede cambiar desde la cotización. |
| Compras | **RN-COM-01** | Una compra PENDIENTE no modifica stock. |
| Compras | **RN-COM-02** | El stock aumenta únicamente al pasar de PENDIENTE a COMPLETADA. |
| Compras | **RN-COM-03** | Una compra CANCELADA no modifica stock. |
| Ventas | **RN-VTA-01** | Una venta se crea COMPLETADA y descuenta stock en el mismo acto. |
| Ventas | **RN-VTA-02** | Una venta completada descuenta las cantidades de su detalle. |
| Ventas | **RN-VTA-03** | Cancelar una venta revierte el descuento de stock de forma transaccional. |
| Presupuestos | **RN-PRE-01** | Un presupuesto pertenece a un cliente y es generado por un vendedor. |
| Presupuestos | **RN-PRE-02** | Un presupuesto posee fecha de vencimiento. |
| Presupuestos | **RN-PRE-03** | Un presupuesto vencido no puede convertirse directamente sin recalcular precios y verificar stock. |
| Presupuestos | **RN-PRE-04** | Un presupuesto puede convertirse como máximo una vez. |
| Presupuestos | **RN-PRE-05** | La conversión no modifica retroactivamente los precios históricos del presupuesto. |
| Presupuestos | **RN-PRE-06** | ACEPTADO y CONVERTIDO representan momentos distintos. |
| Armados | **RN-ARM-01** | Un armado es autónomo y puede existir antes de asociarse a un presupuesto. |
| Armados | **RN-ARM-02** | El sistema deberá advertir posibles incompatibilidades entre componentes, sin impedir su selección o venta. |
| Armados | **RN-ARM-03** | La disponibilidad puede verificarse al cotizar y debe verificarse al confirmar la venta. |
| Armados | **RN-ARM-04** | Solo un armado FINALIZADO puede asociarse a un presupuesto. |
| Armados | **RN-ARM-05** | Los componentes del armado no se duplican en PresupuestoDetalle. |
| Productos | **RN-PRO-01** | Un producto con movimientos asociados se da de baja lógicamente, no físicamente. |
| Productos | **RN-PRO-02** | Clientes, proveedores y usuarios se dan de baja lógicamente cuando corresponda. |
| Productos | **RN-PRO-03** | La marca es texto en el MVP; Marca como entidad es una evolución. |
| Pagos | **RN-PAG-01** | Venta y Pago se mantienen separados conceptualmente. |
| Pagos | **RN-PAG-02** | El pago simulado registra medio, monto y resultado sin servicios externos. |
| Pagos | **RN-PAG-03** | El pago no modifica ni reserva stock. |
| Pagos | **RN-PAG-04** | Mercado Pago es una extensión opcional y no debe alterar el núcleo de Venta/Stock. |
| Usuarios | **RN-USR-01** | Existen dos roles: Administrador y Vendedor. |
| Usuarios | **RN-USR-02** | El Administrador gestiona catálogo, proveedores, compras, usuarios y dashboard y puede realizar tareas del Vendedor. |
| Usuarios | **RN-USR-03** | El Vendedor gestiona clientes, presupuestos, armados, conversiones y ventas. |
| Usuarios | **RN-USR-04** | El cliente no es usuario del sistema y no existe un rol independiente de stock. |

#### Reglas pendientes de definición

- Medios de pago simulados y estados definitivos.
- Cantidad exacta de días para vencimiento de presupuestos.
- Cardinalidad definitiva Venta–Pago.
- Decisiones abiertas del modelo de datos.

Las reglas específicas de las extensiones opcionales se definirán únicamente si se implementa la extensión correspondiente.

### 3.2. Casos de Estudio

#### CE-CAT-01 — Gestión del catálogo

**Actor/es:** Administrador

**Objetivo:** Administrar productos y categorías.

**Flujo principal:**

- Accede al catálogo.
- Registra/modifica categorías.
- Registra/modifica productos.
- El sistema valida y persiste.

**Resultado/postcondiciones:** Producto disponible para operaciones posteriores.

**Excepciones:** Baja lógica si tiene movimientos.

#### CE-COM-01 — Compra y actualización de stock

**Actor/es:** Administrador

**Objetivo:** Reponer existencias.

**Flujo principal:**

- Registra proveedor y fecha.
- Agrega productos, cantidades y precios.
- La compra queda **PENDIENTE** sin afectar stock.
- Al confirmar, pasa a **COMPLETADA** e incrementa stock.

**Resultado/postcondiciones:** Stock incrementado.

**Excepciones:** Cancelar antes de completar no modifica stock.

#### CE-VTA-01 — Venta directa

**Actor/es:** Vendedor / Administrador

**Objetivo:** Registrar una venta sin presupuesto.

**Flujo principal:**

- Selecciona cliente.
- Agrega productos y cantidades.
- Verifica stock.
- Crea venta **COMPLETADA** y descuenta stock.

**Resultado/postcondiciones:** Venta registrada y stock actualizado.

**Excepciones:** Sin stock suficiente no se confirma; cancelar revierte stock.

#### CE-ARM-01 — Armado de PC

**Actor/es:** Vendedor

**Objetivo:** Configurar una PC con componentes.

**Flujo principal:**

- Selecciona componentes.
- Valida categorías obligatorias.
- Verifica disponibilidad.
- Finaliza como **FINALIZADO**.

**Resultado/postcondiciones:** Armado listo para asociarse a presupuesto.

**Excepciones:** No se valida compatibilidad técnica avanzada.

#### CE-PRE-01 — Elaboración y gestión de presupuestos

**Actor/es:** Vendedor

**Objetivo:** Cotizar productos o un armado.

**Flujo principal:**

- Crea presupuesto.
- Agrega productos o armado **FINALIZADO**.
- Registra **PENDIENTE** y vencimiento.
- Gestiona su estado.

**Resultado/postcondiciones:** Presupuesto en un estado válido.

**Excepciones:** Un vencido requiere recalcular antes de vender.

#### CE-PRE-02 — Conversión de presupuesto en venta

**Actor/es:** Vendedor

**Objetivo:** Transformar presupuesto aceptado en venta.

**Flujo principal:**

- Inicia conversión.
- Reverifica stock.
- Crea venta asociada.
- Descuenta stock y marca **CONVERTIDO**.

**Resultado/postcondiciones:** Venta registrada y presupuesto convertido.

**Excepciones:** Conversión única y preservación del historial.

#### CE-PAG-01 — Pago simulado

**Actor/es:** Vendedor / Administrador

**Objetivo:** Registrar cobro interno.

**Flujo principal:**

- Registra cobro.
- Indica medio, monto y resultado.
- Asocia el pago a la venta.

**Resultado/postcondiciones:** Cobro registrado internamente.

**Excepciones:** No modifica stock.

#### CE-USR-01 — Usuarios y roles

**Actor/es:** Administrador

**Objetivo:** Administrar usuarios internos.

**Flujo principal:**

- Registra usuario y rol.
- Valida datos.
- Aplica autorización por rol.

**Resultado/postcondiciones:** Acceso según rol.

**Excepciones:** Baja lógica cuando corresponda.

#### CE-DSH-01 — Dashboard

**Actor/es:** Administrador

**Objetivo:** Monitorear actividad.

**Flujo principal:**

- Accede al dashboard.
- Visualiza indicadores.

**Resultado/postcondiciones:** Visión operativa

**Métricas:** productos de bajo stock, ventas del día y del mes, presupuesto pendientes de confirmación, compras recientes..

**Excepciones:** Métricas adicionales quedan como evolución.

---

## 4. Requerimientos Funcionales

| ID | Nombre | Actor | Descripción | Caso |
| --- | --- | --- | --- | --- |
| **RF-AUT-01** | Inicio de sesión | Administrador/Vendedor | Autenticar mediante credenciales. | CE-USR-01 |
| **RF-AUT-02** | Acceso por roles | Administrador/Vendedor | Restringir operaciones según rol. | CE-USR-01 |
| **RF-PRO-01** | Gestión de productos | Administrador | Registrar, consultar, modificar y dar de baja productos. | CE-CAT-01 |
| **RF-PRO-02** | Gestión de categorías | Administrador | Registrar, consultar, modificar y dar de baja categorías. | CE-CAT-01 |
| **RF-PRO-03** | Baja lógica de productos | Administrador | Impedir eliminación física de productos con movimientos. | CE-CAT-01 |
| **RF-CLI-01** | Gestión de clientes | Vendedor/Administrador | Registrar, consultar, modificar y dar de baja clientes. | CE-VTA-01 |
| **RF-PROV-01** | Gestión de proveedores | Administrador | Registrar, consultar, modificar y dar de baja proveedores. | CE-COM-01 |
| **RF-COM-01** | Registro de compras | Administrador | Registrar compra con proveedor y detalle. | CE-COM-01 |
| **RF-COM-02** | Confirmación de compra | Administrador | Confirmar compra e incrementar stock. | CE-COM-01 |
| **RF-COM-03** | Cancelación de compra | Administrador | Cancelar compra PENDIENTE sin afectar stock. | CE-COM-01 |
| **RF-VTA-01** | Registro de ventas | Vendedor/Administrador | Registrar venta directa o derivada de presupuesto. | CE-VTA-01 / CE-PRE-02 |
| **RF-VTA-02** | Descuento de stock | Vendedor/Administrador | Descontar stock según detalle de venta. | CE-VTA-01 |
| **RF-VTA-03** | Cancelación de venta | Vendedor/Administrador | Cancelar venta y revertir stock transaccionalmente. | CE-VTA-01 |
| **RF-PRE-01** | Creación de presupuestos | Vendedor | Crear presupuestos con productos y/o armado FINALIZADO. | CE-PRE-01 |
| **RF-PRE-02** | Estados de presupuesto | Vendedor | Gestionar estados y vencimiento. | CE-PRE-01 |
| **RF-PRE-03** | Conversión en venta | Vendedor | Convertir una vez un presupuesto vigente y aceptado, verificando stock. | CE-PRE-02 |
| **RF-ARM-01** | Configuración de armado | Vendedor | Configurar y finalizar un armado de PC. | CE-ARM-01 |
| **RF-ARM-02** | Validación de armado | Vendedor | Validar completitud y disponibilidad. | CE-ARM-01 |
| **RF-PAG-01** | Registro de pago simulado | Vendedor/Administrador | Registrar medio, monto y resultado del cobro. | CE-PAG-01 |
| **RF-PAG-02** | Estado del pago | Vendedor/Administrador | Gestionar el resultado del cobro simulado. | CE-PAG-01 |
| **RF-USR-01** | Gestión de usuarios | Administrador | Gestionar usuarios y roles. | CE-USR-01 |
| **RF-DSH-01** | Dashboard operativo | Administrador | Mostrar indicadores operativos del MVP. | CE-DSH-01 |

### 4.1. Historias de Usuario

| ID | Rol | Quiero | Para | RF |
| --- | --- | --- | --- | --- |
| **HU-AUT-01** | Usuario | iniciar sesión con mis credenciales | acceder al sistema. | RF-AUT-01 |
| **HU-PRO-01** | Administrador | registrar, modificar y dar de baja productos | mantener actualizado el catálogo. | RF-PRO-01 |
| **HU-PRO-02** | Administrador | gestionar categorías | clasificar los productos. | RF-PRO-02 |
| **HU-PRO-03** | Administrador | dar de baja lógicamente productos con movimientos | preservar la trazabilidad. | RF-PRO-03 |
| **HU-CLI-01** | Vendedor | gestionar clientes | asociarlos a presupuestos y ventas. | RF-CLI-01 |
| **HU-PROV-01** | Administrador | gestionar proveedores | registrar compras. | RF-PROV-01 |
| **HU-COM-01** | Administrador | registrar una compra con detalle | registrar la reposición. | RF-COM-01 |
| **HU-COM-02** | Administrador | confirmar una compra | incrementar stock. | RF-COM-02 |
| **HU-COM-03** | Administrador | cancelar una compra pendiente | anularla sin afectar stock. | RF-COM-03 |
| **HU-VTA-01** | Vendedor | registrar una venta con detalle | concretar la operación. | RF-VTA-01 |
| **HU-VTA-02** | Vendedor | descontar stock al completar una venta | mantener disponibilidad actualizada. | RF-VTA-02 |
| **HU-VTA-03** | Vendedor | cancelar una venta | revertir su efecto sobre stock. | RF-VTA-03 |
| **HU-PRE-01** | Vendedor | crear un presupuesto para un cliente | cotizar antes de vender. | RF-PRE-01 |
| **HU-PRE-02** | Vendedor | gestionar estados y vencimiento | conocer su situación. | RF-PRE-02 |
| **HU-PRE-03** | Vendedor | convertir un presupuesto en venta | concretar una operación aceptada. | RF-PRE-03 |
| **HU-ARM-01** | Vendedor | configurar un armado de PC | ofrecer una computadora armada. | RF-ARM-01 |
| **HU-ARM-02** | Vendedor | validar completitud y stock del armado | garantizar que sea viable. | RF-ARM-02 |
| **HU-PAG-01** | Vendedor | registrar el cobro mediante pago simulado | cerrar internamente el circuito comercial. | RF-PAG-01 |
| **HU-PAG-02** | Vendedor | registrar el resultado del cobro | conocer el resultado de cada cobro. | RF-PAG-02 |
| **HU-USR-01** | Administrador | gestionar usuarios y roles | controlar el acceso. | RF-USR-01 |
| **HU-DSH-01** | Administrador | visualizar el dashboard operativo | monitorear la actividad. | RF-DSH-01 |

---

## 5. Pantallas de Usuario

| Pantalla | RF | Descripción |
| --- | --- | --- |
| Login | RF-AUT-01 | Autenticación. |
| Dashboard | RF-DSH-01 | Indicadores operativos. |
| Productos | RF-PRO-01, RF-PRO-03 | Listado, alta, edición y baja lógica. |
| Categorías | RF-PRO-02 | Gestión de categorías. |
| Clientes | RF-CLI-01 | Gestión de clientes. |
| Proveedores | RF-PROV-01 | Gestión de proveedores. |
| Compras | RF-COM-01/02/03 | Registro y estados. |
| Ventas | RF-VTA-01/02/03 | Registro, stock y cancelación. |
| Presupuestos | RF-PRE-01/02/03 | Creación, estados y conversión. |
| Armados | RF-ARM-01/02 | Configuración y validación. |
| Pago simulado | RF-PAG-01/02 | Registro del cobro. |
| Usuarios | RF-USR-01 | Gestión de usuarios y roles. |

Los detalles de interfaz que dependan de decisiones pendientes se resolverán posteriormente. Las extensiones opcionales no generan pantallas obligatorias del MVP.

---

## 6. Glosario

| Término | Definición |
| --- | --- |
| **Administrador** | Rol con acceso al catálogo, proveedores, compras, usuarios, dashboard y tareas del Vendedor. |
| **Armado (de PC)** | Configuración de una computadora compuesta por productos de distintas categorías. |
| **ArmadoComponente** | Entidad que relaciona un armado con sus productos, cantidad y precio unitario. |
| **Baja lógica (soft delete)** | Desactivación de un registro sin eliminarlo físicamente. |
| **Categoría** | Clasificación de productos. |
| **Cliente** | Persona que solicita presupuestos o compra; no es usuario del sistema. |
| **Compra** | Operación mediante la cual la tienda adquiere productos; incrementa stock al confirmarse. |
| **CompraDetalle** | Entidad que relaciona compra y productos adquiridos. |
| **Conversión** | Transformación de un presupuesto aceptado en una venta. |
| **Dashboard** | Vista de indicadores operativos. |
| **Envíos y logística** | Extensión opcional Nivel 3 para gestionar entregas. |
| **Garantías y devoluciones** | Extensión opcional Nivel 2 para procesos de postventa. |
| **Kardex / historial de movimientos** | Extensión opcional Nivel 1 para registrar movimientos de stock. |
| **Marca** | Fabricante o marca; en el MVP es un campo de texto. |
| **Mercado Pago** | Extensión opcional Nivel 4 para integrar un proveedor externo de pagos. |
| **Pago** | Entidad que representa el cobro de una venta. |
| **Pago simulado** | Funcionalidad obligatoria del MVP para registrar internamente un cobro sin servicios externos. |
| **Presupuesto** | Propuesta de venta para un cliente, con vencimiento y estados. |
| **PresupuestoDetalle** | Entidad que relaciona presupuesto y productos cotizados. |
| **Producto** | Artículo comercializado; también puede ser componente de un armado. |
| **Proveedor** | Empresa o persona que suministra productos. |
| **Rol** | Nivel de acceso: Administrador o Vendedor. |
| **Reserva de stock** | Evolución futura que distingue stock reservado y disponible. |
| **Stock** | Cantidad disponible de un producto; aumenta con compras confirmadas y disminuye con ventas. |
| **Usuario** | Usuario interno con credenciales y rol. |
| **Vendedor** | Rol que gestiona clientes, presupuestos, armados y ventas. |
| **Venta** | Operación comercial que descuenta stock al completarse. |
| **VentaDetalle** | Entidad que relaciona venta y productos vendidos. |
