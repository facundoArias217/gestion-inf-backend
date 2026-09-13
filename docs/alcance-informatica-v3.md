# Análisis de alcance funcional — Sistema de Gestión de Tienda de Informática

**Versión: v3**

**Proyecto integrador universitario — desarrollo individual**
Materias integradas: Análisis de Sistemas · Backend (Node.js + Express) · Frontend (React)

---

## Historial de cambios

| Versión | Descripción | Autor |
|---|---|---|
| v2 | Versión previa del alcance funcional. | Equipo del proyecto |
| v3 | Consolidación del alcance v2 incorporando las decisiones cerradas en el análisis del modelo de datos. | Equipo del proyecto |

**Resumen de actualizaciones de v3 respecto de v2:**

1. **Armado de PC:** se consolida como entidad autónoma, asociable opcionalmente a un `Presupuesto`. Los componentes de un armado no se duplican en el detalle del presupuesto. La asociación requiere que el armado esté en estado `FINALIZADO`.
2. **Presupuesto:** se incorpora `fechaVencimiento`. Se definen estados definitivos `PENDIENTE`, `ACEPTADO`, `RECHAZADO`, `VENCIDO` y `CONVERTIDO`; el estado `cancelado` de v2 se reemplaza por `RECHAZADO`. `ACEPTADO` y `CONVERTIDO` representan momentos distintos.
3. **Presupuesto → Venta:** se precisa la cardinalidad a lo sumo uno: un presupuesto puede convertirse como máximo en una venta.
4. **Venta:** conserva estado en el MVP (`COMPLETADA`, `CANCELADA`).
5. **Compra / Venta y stock:** se formaliza el comportamiento del stock en cada estado (ver reglas de negocio).
6. **Producto:** se incorpora `marca` como atributo de texto.
7. **Historial de precios:** los detalles de operaciones conservan `cantidad` y `precioUnitario`; `subtotal` y `total` se tratan como valores derivados.

---

## 1. Objetivo general del sistema

El problema real que resuelve una tienda de informática no es solo "tener stock cargado", sino manejar un catálogo con muchas categorías distintas (procesadores, placas, RAM, gabinetes, etc.) y, sobre todo, resolver un proceso de venta que muchas veces **no es la venta de un único producto suelto**, sino de un conjunto de componentes pensados para funcionar juntos (un armado de PC) o de una cotización previa que el cliente evalúa antes de comprar (un presupuesto).

El propósito principal del sistema es controlar el stock de forma confiable a través de tres movimientos (compras, ventas, armados) y, al mismo tiempo, dar soporte a un proceso de negocio propio del rubro: cotizar y armar una computadora a partir de componentes individuales, verificando que haya stock de cada uno antes de confirmar la operación.

Esto es justamente lo que se pide evitar: que el proyecto termine siendo un CRUD de stock genérico. La sección 4 desarrolla en detalle cómo evitarlo sin sobrecargar el alcance.

---

## 2. Actores

Se recomienda **no** modelar al cliente como usuario del sistema (sin portal de autogestión ni carrito propio — ver sección 12), y **no** crear un actor "encargado de stock" separado: en una tienda chica, el control de stock es una función del sistema (se actualiza automáticamente con compras/ventas/armados), no una tarea que requiera un rol y permisos exclusivos. Agregarlo solo sumaría un tercer rol sin lógica de autorización realmente distinta a la del administrador.

Con ese criterio, dos actores:

### Administrador
- Gestión del catálogo: productos, categorías, proveedores.
- Registro de compras a proveedores (que incrementan stock).
- Gestión de usuarios.
- Visualización del dashboard general.
- Puede realizar cualquier tarea del vendedor.
### Vendedor
- Gestión de clientes.
- Creación de presupuestos (incluyendo armados de PC).
- Conversión de presupuestos en ventas.
- Registro de ventas directas (productos sueltos, sin pasar por presupuesto).

Dos roles alcanzan para demostrar control de acceso basado en roles sin necesidad de una matriz de permisos compleja.

---

## 3. Módulos funcionales posibles

| Módulo | Problema que resuelve | Entidades | Complejidad | ¿Incluir? |
|---|---|---|---|---|
| Productos | Catálogo centralizado | Producto | Baja | Sí — obligatorio |
| Categorías | Clasificar productos (necesario para armados) | Categoria | Baja | Sí — obligatorio |
| Marcas | Identificar fabricante | (atributo o entidad propia) | Baja | Opcional — ver nota |
| Clientes | Identificar compradores | Cliente | Baja | Sí — obligatorio |
| Proveedores | Saber origen de compras | Proveedor | Baja | Sí — obligatorio |
| Stock | Cantidad disponible por producto | (campo en Producto) | Baja | Sí, pero **no como módulo aparte** — ver nota |
| Compras | Registrar reposición e incrementar stock | Compra, CompraDetalle | Media | Sí — obligatorio |
| Ventas | Registrar venta y descontar stock | Venta, VentaDetalle | Media | Sí — obligatorio |
| Presupuestos | Cotizar antes de vender | Presupuesto, PresupuestoDetalle | Media | Sí — es uno de los dos módulos diferenciadores |
| Usuarios | Autenticación y roles | Usuario | Media | Sí — obligatorio |
| Garantías/devoluciones | Post-venta con reingreso condicional de stock | Garantia | Media/Alta | Opcional — buen valor de análisis, pero no imprescindible |
| Armado de PCs | Vender un conjunto de componentes compatibles entre sí | Armado, ArmadoComponente | Media/Alta | Sí — es el otro módulo diferenciador |
| Componentes | — | — | — | **No es una entidad nueva** (ver nota) |

**Nota sobre Marcas:** para el MVP alcanza con un campo de texto en Producto (`marca`). Convertirlo en una entidad propia (con su propio catálogo) es una mejora de normalización de bajo costo, así que se deja como opcional si sobra tiempo — no cambia el análisis de fondo.

**Nota sobre Stock:** no conviene crear un módulo "Stock" separado con su propio CRUD. El stock es un atributo de Producto que se modifica como efecto secundario de otras operaciones (Compra lo incrementa, Venta y Armado lo decrementan). Un módulo de stock con historial de movimientos (kardex) es una mejora interesante pero de mayor complejidad — se dejaría como funcionalidad futura.

**Nota sobre Componentes:** no conviene modelar "Componente" como una entidad distinta de "Producto". Un componente **es** un producto que pertenece a una categoría de tipo componente (procesador, RAM, motherboard, etc.). Duplicar el concepto en dos entidades generaría redundancia de modelado sin ningún beneficio.

---

## 4. Diferenciación respecto de un simple sistema de stock

Este es el punto más importante del análisis, porque es lo que decide si el proyecto tiene identidad propia o es "otro más" de gestión de stock genérico.

Se evaluaron cuatro candidatas, distinguiendo entre diferenciadores de **dominio** y una funcionalidad de **complejidad técnica adicional**:

### Armado de PCs
- **Valor de negocio:** alto — es la funcionalidad más identificable del rubro informático específicamente.
- **Complejidad:** media/alta. Requiere: seleccionar productos de distintas categorías, validar que estén cubiertas las categorías consideradas obligatorias para un armado (procesador, motherboard, fuente, gabinete, RAM, almacenamiento), y verificar stock de cada componente antes de confirmar.
- **Relación con análisis de sistemas:** muy buena — obliga a modelar una relación N:M (Armado–Producto) y una regla de negocio de "completitud" no trivial.
- **Decisión:** **incluir**. Es la funcionalidad con mejor relación valor/complejidad de las tres, siempre que la "compatibilidad" se mantenga básica (ver sección 6, regla 4) y no se intente validar compatibilidad técnica real (sockets, wattage, chipsets — ver sección 12).
### Presupuestos
- **Valor de negocio:** alto — modela un proceso real: cotizar antes de vender, con posibilidad de que el cliente no confirme.
- **Complejidad:** media. Requiere un estado (pendiente/convertido/vencido/rechazado) y una operación de conversión a venta.
- **Relación con análisis de sistemas:** buena — es un caso claro de máquina de estados simple, y reutiliza la misma lógica de selección de productos que las ventas.
- **Decisión:** **incluir**. Además, se integra naturalmente con el armado de PCs: un armado se cotiza primero como presupuesto y se confirma después como venta, lo que da al sistema un flujo central sólido (ver sección 5) sin agregar entidades extra.
### Garantías / devoluciones
- **Valor de negocio:** real, pero no es exclusivo del rubro informático (aplica a cualquier comercio minorista).
- **Complejidad:** media/alta — maneja varios estados posibles del producto devuelto y su efecto condicional sobre el stock.
- **Decisión:** **opcional**. Aporta valor de análisis (la regla 7 de la sección 6 es interesante), pero no es indispensable para diferenciar el proyecto, y su complejidad no es despreciable. Se dejaría para si sobra tiempo después de completar el MVP.
### Integración de pagos online (Mercado Pago)
- **Valor de negocio:** medio/alto — agrega un flujo real de pago asociado a una venta y permite demostrar integración con un servicio externo.
- **Complejidad:** alta. Requiere desacoplar la venta del pago, manejar estados de pago, integrar una API externa y contemplar la comunicación de resultados de la operación.
- **Decisión:** **funcionalidad de complejidad adicional, planificada para una versión posterior al MVP**. No reemplaza a los diferenciadores de dominio: **Armado de PCs + Presupuestos** siguen siendo la identidad principal del sistema. Mercado Pago aporta principalmente complejidad técnica e integración externa.
- **Criterio de alcance:** debe incorporarse sobre el flujo interno de ventas, no mediante un e-commerce público ni un carrito de compras para clientes.

**Conclusión:** la combinación **Armado de PCs + Presupuestos** es la que mejor equilibrio ofrece entre identidad de negocio propia del rubro y complejidad manejable por una sola persona. Ambas features se combinan naturalmente en un solo flujo central (sección 5), en lugar de ser tres funcionalidades sueltas y desconectadas.

---

## 5. Flujo principal del sistema

### Flujo 1 (el flujo diferenciador — atraviesa todo el sistema)
Cliente quiere armar una PC → el vendedor selecciona componentes de distintas categorías (procesador, motherboard, RAM, almacenamiento, fuente, gabinete) → el sistema valida que estén cubiertas las categorías obligatorias y que haya stock de cada componente → se configura un armado que, al estar `FINALIZADO`, puede asociarse a un presupuesto → se genera un presupuesto que incluye ese armado → el cliente lo evalúa → si acepta, el presupuesto se convierte en venta → al confirmarse la venta se vuelve a verificar stock (pudo cambiar desde que se cotizó) y se descuenta stock de cada componente utilizado.

Este es el flujo a mostrar en la defensa: demuestra el módulo diferenciador, la relación N:M componentes-armado, la máquina de estados de presupuesto, y el descuento de stock, todo en un solo circuito.

### Flujo 2 — Reposición de stock
El administrador registra una compra a un proveedor, con el detalle de productos y cantidades → al confirmar la compra (paso de `PENDIENTE` a `COMPLETADA`), se incrementa el stock de cada producto involucrado.

### Flujo 3 — Venta directa (sin presupuesto)
Un cliente compra un producto suelto (por ejemplo, un mouse) sin pasar por una cotización previa → el vendedor registra la venta directamente → se descuenta stock. Este flujo es intencionalmente simple: sirve para no obligar a que **toda** venta pase por un presupuesto, lo cual sería poco realista.

---

## 6. Reglas de negocio

### Stock

1. No se puede vender (ni incluir en un armado) un producto sin stock suficiente.
2. Una venta descuenta stock de cada producto vendido; una compra lo incrementa.
3. Debe verificarse el stock al momento de confirmar una venta o un armado (la disponibilidad pudo haber cambiado desde que se cotizó).

### Compras

4. Una compra en estado `PENDIENTE` no modifica el stock.
5. Una compra incrementa el stock al pasar a `COMPLETADA`; el incremento ocurre únicamente en la transición de `PENDIENTE` a `COMPLETADA`, respetando las cantidades del detalle de la compra.
6. Una compra en estado `CANCELADA` no modifica el stock (no llegó a afectar el inventario).

### Ventas

7. Una venta se crea directamente en estado `COMPLETADA` y descuenta stock en el mismo acto.
8. Una venta en estado `COMPLETADA` decrementa el stock de cada producto vendido según las cantidades registradas en su detalle.
9. Una venta en estado `CANCELADA` revierte el decremento realizado al completarse, devolviendo al stock las cantidades registradas en su detalle. Esta reversión se realiza de forma transaccional.

### Presupuestos

10. Un presupuesto pertenece a un cliente y es generado por un usuario (vendedor).
11. Un presupuesto posee una fecha de vencimiento (`fechaVencimiento`).
12. Un presupuesto vencido (más de X días desde su creación) no puede convertirse directamente en venta sin recalcular precios y stock.
13. Un presupuesto puede convertirse en una venta, como máximo una única vez.
14. Una venta no puede modificar retroactivamente el presupuesto del que proviene (para mantener trazabilidad histórica de precios cotizados).
15. `ACEPTADO` representa que el cliente acepta el presupuesto; `CONVERTIDO` representa que el presupuesto ya generó una venta. Son momentos distintos en la máquina de estados.

### Armados

16. Un armado es una entidad autónoma que representa la configuración de una PC; puede existir antes de asociarse a un presupuesto.
17. Un armado debe incluir, como mínimo, una categoría de cada tipo considerado obligatorio (por ejemplo: procesador, motherboard, fuente) — es una regla de **completitud básica**, no de compatibilidad técnica real (no se valida socket, wattage ni chipset).
18. El stock de los componentes de un armado se verifica dos veces: al crear el presupuesto (disponibilidad informativa) y al confirmar la venta (disponibilidad real), porque puede haber cambiado en el medio.
19. Un armado puede asociarse a un presupuesto únicamente cuando se encuentra en estado `FINALIZADO`.
20. Los componentes de un armado no se duplican en el detalle del presupuesto; la PC armada se referencia desde el armado hacia el presupuesto, y sus componentes se mantienen únicamente en el armado.

### Productos y baja lógica

21. Un producto no puede eliminarse del catálogo si tiene movimientos asociados (compras, ventas o armados) — solo puede darse de baja (soft delete), para no romper la trazabilidad histórica.
22. El mismo criterio de baja lógica aplica a clientes, proveedores y usuarios cuando corresponda, evitando eliminar físicamente información histórica.

### Pagos

23. La información de pago debe mantenerse separada conceptualmente de la venta: una Venta representa la operación comercial y un Pago representa el intento/resultado de cobrarla.
24. La incorporación de un medio de pago externo no debe alterar las reglas fundamentales de venta y stock; el flujo deberá poder evolucionar hacia nuevos medios de pago sin rediseñar el núcleo de ventas.
25. La reserva de stock vinculada a un pago, si se implementa en una versión futura, deberá distinguir stock total, reservado y disponible, y liberar una reserva cuando corresponda según el estado de la operación. Esta regla queda como lineamiento futuro y **no forma parte del MVP**.

---

## 7. Modelo conceptual de entidades

```
Categoria
- id
- nombre                    (ej: Procesador, Placa de Video, RAM, Motherboard...)

Producto
- id
- nombre
- descripcion
- marca                     (texto; opcionalmente entidad Marca aparte)
- categoriaId                (FK -> Categoria)
- precio
- stock
- activo                     (baja lógica)

Proveedor
- id
- razonSocial / nombre
- cuit
- email
- telefono
- direccion
- activo                     (baja lógica)

Cliente
- id
- nombre
- apellido
- dni
- email
- telefono
- direccion
- activo                     (baja lógica)

Usuario
- id
- nombre
- email
- passwordHash
- rol                       (administrador | vendedor)
- activo                     (baja lógica)

Compra
- id
- proveedorId                (FK -> Proveedor)
- usuarioId                  (FK -> Usuario, quien registra)
- fecha
- estado                     (pendiente | completada | cancelada)

CompraDetalle                (resuelve Compra N:M Producto)
- id
- compraId                  (FK -> Compra)
- productoId                 (FK -> Producto)
- cantidad
- precioUnitario             (histórico)

Presupuesto
- id
- clienteId                  (FK -> Cliente)
- usuarioId                  (FK -> Usuario, vendedor)
- fecha
- fechaVencimiento
- estado                     (pendiente | aceptado | rechazado | vencido | convertido)

PresupuestoDetalle           (resuelve Presupuesto N:M Producto)
- id
- presupuestoId              (FK -> Presupuesto)
- productoId                 (FK -> Producto)
- cantidad
- precioUnitario             (histórico)

Venta
- id
- clienteId                  (FK -> Cliente)
- usuarioId                  (FK -> Usuario, vendedor)
- presupuestoId               (FK -> Presupuesto, opcional y único)
- fecha
- estado                     (completada | cancelada)

VentaDetalle                 (resuelve Venta N:M Producto)
- id
- ventaId                    (FK -> Venta)
- productoId                  (FK -> Producto)
- cantidad
- precioUnitario             (histórico)

Armado
- id
- usuarioId                  (FK -> Usuario, quien configura)
- presupuestoId               (FK -> Presupuesto, opcional; requiere armado FINALIZADO)
- nombre / descripcion
- estado                     (borrador | finalizado)

ArmadoComponente             (resuelve Armado N:M Producto)
- id
- armadoId                   (FK -> Armado)
- productoId                  (FK -> Producto)
- cantidad
- precioUnitario             (histórico)
```

**Nota sobre valores derivados:** `subtotal` (en los detalles) y `total` (en las operaciones) son valores que pueden obtenerse de los detalles; no se tratan como datos persistidos necesarios. Cada detalle conserva `cantidad` y `precioUnitario` para mantener el historial de precios.

**Relaciones y cardinalidades clave:**

- **Producto ↔ Categoría:** 1:N.
- **Producto ↔ Proveedor:** conviene **no** modelarla como relación directa. En la práctica, un producto puede comprarse a distintos proveedores a lo largo del tiempo, y una compra involucra varios productos — por eso la relación real es **N:M, resuelta a través de Compra/CompraDetalle**, no un FK directo en Producto.
- **Compra ↔ Producto:** N:M, resuelta con CompraDetalle.
- **Venta ↔ Producto:** N:M, resuelta con VentaDetalle.
- **Cliente ↔ Venta:** 1:N.
- **Presupuesto ↔ Producto:** N:M, resuelta con PresupuestoDetalle.
- **Armado ↔ Componentes:** N:M, resuelta con ArmadoComponente ("Componente" no es una entidad distinta de "Producto").
- **Armado ↔ Presupuesto:** un armado autónomo puede asociarse opcionalmente a un presupuesto (0..1). Los componentes del armado no se duplican en PresupuestoDetalle.
- **Presupuesto ↔ Venta:** 1 → 0..1. Un presupuesto puede convertirse en, a lo sumo, una venta.

---

## 8. Estados

### Compra

- `PENDIENTE`: la compra fue registrada pero aún no fue confirmada; no modifica stock.
- `COMPLETADA`: la compra fue confirmada; incrementa stock.
- `CANCELADA`: la compra fue anulada; no modifica stock.

### Presupuesto

- `PENDIENTE`: el presupuesto fue creado y está a la espera de la decisión del cliente.
- `ACEPTADO`: el cliente acepta el presupuesto (todavía no se ha generado la venta).
- `RECHAZADO`: el cliente no acepta la propuesta.
- `VENCIDO`: el presupuesto superó su fecha de vencimiento sin ser convertido.
- `CONVERTIDO`: el presupuesto ya generó una venta.

### Venta

- `COMPLETADA`: la venta fue concretada; decrementó stock.
- `CANCELADA`: la venta fue anulada; revierte el decremento de stock.

### Armado

- `BORRADOR`: la configuración está en edición; no puede asociarse a un presupuesto.
- `FINALIZADO`: la configuración está lista; puede asociarse a un presupuesto.

---

## 9. Alcance MVP

### OBLIGATORIAS — v1.0 (MVP)
- Autenticación con dos roles (administrador, vendedor).
- Gestión de productos y categorías.
- Gestión de clientes y proveedores.
- Compras con detalle de productos (incrementa stock al confirmarse).
- Ventas con detalle de productos (descuenta stock), incluyendo venta directa sin presupuesto.
- Presupuestos: creación, conversión a venta, estados (incluyendo vencimiento).
- Armado de PCs: selección de componentes, validación de completitud básica y de stock, integrado con presupuestos/ventas.

### PLANIFICADAS / VERSIONES POSTERIORES
- **v1.1:** preparación del dominio para pagos mediante la incorporación conceptual de `Pago` y sus estados, sin integración real con un proveedor externo.
- **v2.0:** integración con Mercado Pago sobre ventas existentes. Incluye comunicación con la API del proveedor y manejo de estados de pago.
- **v2.1:** reserva de stock vinculada al proceso de pago, si el tiempo y la complejidad restante lo permiten.
- Marca como entidad propia (en vez de campo de texto).
- Garantías/devoluciones.
- Historial de movimientos de stock (kardex).
- Dashboard con métricas adicionales (productos más vendidos, comparativas).

### FUERA DE ALCANCE
- E-commerce con carrito de compras público y checkout para clientes.
- Facturación real / integración con AFIP.
- Otros proveedores de pago distintos de la integración definida para Mercado Pago.
- Funciones propias de una plataforma financiera, conciliación bancaria o gestión financiera avanzada.
- Compatibilidad técnica avanzada de hardware (sockets, chipsets, cálculo de wattage).
- Generación de imágenes (renders de la PC armada).
- Importación automática de catálogos de proveedores.
- Múltiples sucursales.
- Sistema de envíos.

---

## 10. Dashboard

- Productos con stock bajo.
- Ventas del día y del mes (monto y cantidad).
- Presupuestos pendientes de confirmar.
- Compras recientes.
- Productos más vendidos — opcional, requiere una consulta de agregación un poco más elaborada; se puede sumar si el resto del dashboard ya está resuelto.

Se evitan métricas que no tengan uso directo (comparativas por vendedor, proyecciones, gráficos de tendencia histórica).

---

## 11. API REST aproximada

```
POST   /auth/login

GET    /productos
POST   /productos
GET    /productos/:id
PUT    /productos/:id

GET    /categorias
POST   /categorias

GET    /clientes
POST   /clientes

GET    /proveedores
POST   /proveedores

GET    /compras
POST   /compras                     (incluye detalle de productos, incrementa stock)
GET    /compras/:id

GET    /ventas
POST   /ventas                      (incluye detalle de productos, descuenta stock)
GET    /ventas/:id

GET    /presupuestos
POST   /presupuestos
GET    /presupuestos/:id
PUT    /presupuestos/:id/estado
POST   /presupuestos/:id/convertir  (genera la venta asociada)

POST   /armados                     (con lista de componentes)
GET    /armados/:id
GET    /armados/:id/validar         (chequeo de completitud + stock)

GET    /dashboard/resumen
```

---

## 12. Complejidad general

**Clasificación: medio.**

Es un escalón más complejo que un sistema de stock simple, porque tiene **varias entidades de detalle** (CompraDetalle, VentaDetalle, PresupuestoDetalle, ArmadoComponente) que implican relaciones N:M reales, más una máquina de estados (Presupuesto, y estados para Compra, Venta y Armado) y una regla de completitud/validación (Armado). El MVP no depende de integraciones externas ni de módulos de post-venta obligatorios. Si se incorpora Mercado Pago, la complejidad aumenta por la integración externa, los estados de pago y la necesidad de mantener consistencia entre venta, pago y stock.

**Módulos más difíciles de implementar:**
- **Armado de PCs:** tanto la lógica de validación (categorías obligatorias + stock) como el frontend para seleccionar componentes de múltiples categorías de forma clara.
- **Presupuestos → Ventas:** el manejo de estados y la conversión (recalcular stock/precios al confirmar) requiere cuidado para no duplicar lógica con las ventas directas.
- **Pagos (v2.0):** integración externa, estados de transacción y sincronización con la venta.
- **Reserva de stock (v2.1/futura):** distinguir stock disponible y reservado, liberar reservas y evitar inconsistencias ante operaciones concurrentes o pagos que no finalizan.
- **Compras y Ventas con detalle:** los formularios de "múltiples ítems" (agregar/quitar productos con cantidad y precio) son, en la práctica, la parte de frontend que más tiempo suele llevar, incluso siendo conceptualmente simple.

---

## 13. Riesgos de alcance

- **Pagos online / integración con Mercado Pago:** no forman parte del MVP v1.0. Se planifican para v2.0 porque requieren credenciales de proveedor, integración con API, manejo de estados de transacción y eventualmente webhooks. La integración deberá apoyarse sobre el modelo de Venta/Pago ya preparado en v1.1.
- **Reserva de stock asociada al pago:** se considera v2.1/futura. La dificultad está en mantener consistencia entre stock disponible, stock reservado y estado del pago, especialmente ante vencimientos, rechazos, reintentos o concurrencia.
- **Facturación real / integración con AFIP:** fuera de alcance — tiene validez fiscal real y reglas propias de un sistema de facturación electrónica; totalmente desproporcionado para el objetivo académico.
- **E-commerce / carrito de compras público:** fuera de alcance — implicaría un frontend público completo, sesiones de invitados y checkout, prácticamente un segundo sistema.
- **Compatibilidad avanzada de hardware:** fuera de alcance — validar sockets, chipsets o cálculo de consumo (wattage) real requeriría mantener una base de datos de especificaciones técnicas por componente y reglas de matching; es un proyecto de datos en sí mismo. Se mantiene solo la validación de completitud básica (sección 6, regla 17).
- **Generación de imágenes** (por ejemplo, un render de la PC armada): fuera de alcance — es contenido multimedia, no aporta al análisis de sistemas.
- **Importación automática de catálogos de proveedores:** fuera de alcance — implica parsers para formatos externos variables (Excel, XML, APIs de terceros) que no son parte del dominio del proyecto.
- **Múltiples sucursales:** fuera de alcance — multiplicaría stock, compras y ventas por sucursal sin aportar valor proporcional a un proyecto individual.
- **Sistema de envíos:** fuera de alcance — es una integración logística externa, ajena al objetivo del proyecto.

Si en algún momento del desarrollo aparece la tentación de sumar alguno de estos puntos, es señal de que el alcance se está corriendo del objetivo académico original.

---

## 14. Versionado y roadmap de implementación

El proyecto se plantea como una evolución por versiones para mantener el alcance controlado y, al mismo tiempo, demostrar que el diseño puede crecer sin rehacer el sistema. Las versiones posteriores son una planificación de evolución, no implican que deban implementarse todas dentro del período académico.

| Versión | Objetivo | Estado esperado |
|---|---|---|
| **v0.1** | Fundaciones: estructura frontend/backend, base de datos, modelo inicial, manejo de errores y autenticación base | Base técnica |
| **v0.2** | Usuarios, roles, productos y categorías | Planificada |
| **v0.3** | Clientes, proveedores, compras y actualización de stock | Planificada |
| **v0.4** | Ventas y presupuestos | Planificada |
| **v0.5** | Armado de PCs e integración completa con presupuestos/ventas | Planificada |
| **v1.0** | MVP completo, integración, validaciones, UX, pruebas y documentación | **Objetivo obligatorio** |
| **v1.1** | Preparación del dominio para pagos: entidad Pago y estados, sin proveedor real | Planificada |
| **v2.0** | Integración de Mercado Pago sobre el flujo interno de ventas | Mejora futura |
| **v2.1** | Reserva de stock vinculada al pago | Mejora futura / opcional |
| **v3+** | E-commerce, múltiples sucursales, envíos u otras extensiones | Fuera del alcance actual / futuro |

Cada requerimiento funcional que se derive de este documento deberá poder asociarse a una versión y a un estado. Como criterio de trazabilidad se recomienda utilizar, como mínimo: **RF → versión → módulo → estado**. Los estados pueden ser `Obligatorio v1.0`, `Planificado`, `Futuro` o `Fuera de alcance`.

### 14.1 Criterio de escalabilidad

El sistema deberá permitir la incorporación progresiva de nuevas funcionalidades y módulos sin alterar de manera significativa las funcionalidades existentes. Esto se refleja especialmente en la separación conceptual entre Venta y Pago: la venta constituye el núcleo comercial y el pago puede evolucionar desde un registro interno hasta una integración con Mercado Pago y, eventualmente, otros medios.

La escalabilidad también se contempla para futuras reservas de stock, garantías/devoluciones, kardex, nuevas modalidades de venta y otros módulos que no forman parte del MVP. Esta capacidad debe entenderse como **diseño preparado para evolución**, no como obligación de implementar todas esas funcionalidades durante el proyecto.

### 14.2 Decisiones de negocio todavía pendientes

Para evitar que el BRD o FRD introduzcan decisiones no acordadas, quedan deliberadamente abiertas las siguientes definiciones para la etapa de diseño detallado:

- Quién inicia el pago y desde qué pantalla o flujo.
- Si la Venta se crea antes del intento de pago o como resultado de una operación de pago.
- En qué momento exacto se considera confirmado el pago.
- Estados definitivos de `Pago` y transiciones permitidas.
- Qué ocurre ante pago rechazado, cancelado, abandonado o fallido.
- Si se permiten reintentos y bajo qué condiciones.
- Uso de webhook, consulta directa al proveedor o combinación de ambos para confirmar el resultado.
- Datos exactos de Mercado Pago que deberán persistirse y cuáles solo se consultarán externamente.
- Duración y condiciones de una eventual reserva de stock en v2.1.
- El valor de "X días" que determina el vencimiento de un presupuesto (parámetro de `fechaVencimiento`).

Estas decisiones **no deben ser inventadas** al redactar el BRD/FRD. Deben quedar como pendientes hasta que se definan explícitamente.

---

## 15. Restricciones y dependencias relevantes

- El cliente **no** es usuario del sistema: no hay portal de autogestión ni carrito de compras propio.
- El stock es un atributo de Producto y se modifica como efecto secundario de compras, ventas y armados; no se contempla un rol o módulo de stock separado.
- Las operaciones de stock (incremento por compra, decremento por venta, reversión por cancelación) deben ejecutarse de forma consistente y transaccional.
- Los productos, clientes, proveedores y usuarios con movimientos asociados se dan de baja de forma lógica (soft delete), no se eliminan físicamente.
- `Armado` y `Presupuesto` son los principales elementos diferenciadores del sistema.
- Mercado Pago, reserva de stock, garantías/devoluciones, kardex y Marca como entidad son funcionalidades futuras y no forman parte del MVP v1.0.
- El proyecto será desarrollado individualmente y debe mantenerse dentro de un alcance académico razonable.

---

## 16. Decisiones importantes que afectan el funcionamiento del sistema

1. **Armado autónomo:** la configuración de una PC es una entidad independiente que puede existir antes de asociarse a un presupuesto, y se asocia opcionalmente a un presupuesto solo cuando alcanza el estado `FINALIZADO`.
2. **Sin duplicación de componentes:** los componentes de un armado se registran una única vez en el armado; no se replican en el detalle del presupuesto.
3. **Conversión única:** un presupuesto puede generar como máximo una venta, preservando la trazabilidad histórica.
4. **Historial de precios:** los detalles de compra, presupuesto, venta y armado conservan `precioUnitario` al momento de la operación.
5. **Valores derivados:** `subtotal` y `total` se obtienen a partir de los detalles y los precios históricos, en lugar de tratarse como datos persistidos necesarios.
6. **Comportamiento de stock por estado:** las compras incrementan stock solo al confirmarse; las ventas decrementan al completarse y revierten al cancelarse.

---

## 17. Propuesta final

El sistema tendrá como núcleo un conjunto de módulos obligatorios de gestión (productos/categorías, clientes, proveedores, compras, ventas y usuarios) más los dos diferenciadores de dominio (presupuestos y armado de PCs). Sobre ese núcleo se deja preparado el camino para incorporar pagos online sin convertir la primera versión en un proyecto desproporcionado.

El flujo central de la versión MVP será:

**Cliente → selección de componentes → armado de PC → presupuesto → conversión a venta → verificación de stock → descuento de stock.**

En una evolución posterior, el flujo podrá extenderse conceptualmente a:

**Venta → Pago → Stock**, incorporando Mercado Pago en v2.0 y, si el tiempo y la complejidad lo permiten, reserva de stock asociada al pago en v2.1.

Esta propuesta prioriza:
1. **Terminabilidad:** v1.0 concentra el trabajo obligatorio y evita que las integraciones externas comprometan la entrega.
2. **Complejidad suficiente:** relaciones N:M, entidades de detalle, máquinas de estados, validaciones de negocio e integración futura con servicios externos.
3. **Identidad del dominio:** el armado de PCs y los presupuestos no son CRUD genéricos de stock.
4. **Evolución controlada:** el modelo permite agregar Pago, reservas y otros módulos sin rediseñar el núcleo.
5. **Trazabilidad:** cada requerimiento puede vincularse con una versión, módulo y estado.
6. **Viabilidad académica:** el objetivo principal continúa siendo un MVP completo y defendible desarrollado individualmente en aproximadamente 11 semanas.