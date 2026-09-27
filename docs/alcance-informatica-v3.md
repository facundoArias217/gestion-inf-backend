<!-- Nota: ajustado según el BRD v1.1 (docs/brd.md), fuente de verdad del proyecto. Se incorporó la RN-ARM-02 ("El sistema deberá advertir posibles incompatibilidades entre componentes, sin impedir su selección o venta"), que este documento omitía al limitar el armado a la validación de completitud básica. -->

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
| v3.1 | Reformulación de pagos: incorporación del pago simulado al MVP y reclasificación de Mercado Pago, envíos/logística y demás ampliaciones como extensiones opcionales ordenadas por dificultad. El roadmap obligatorio termina en el MVP. | Equipo del proyecto |

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
- **Decisión:** **incluir**. Es la funcionalidad con mejor relación valor/complejidad de las tres, siempre que la "compatibilidad" se mantenga básica (ver sección 6, regla 4) y no se intente validar compatibilidad técnica real (sockets, wattage, chipsets — ver sección 12); el sistema sí deberá advertir posibles incompatibilidades entre componentes, sin impedir su selección o venta (ver sección 6, regla 18).
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
- **Decisión:** **extensión opcional**, no forma parte del MVP. No reemplaza a los diferenciadores de dominio: **Armado de PCs + Presupuestos** siguen siendo la identidad principal del sistema. Mercado Pago aporta principalmente complejidad técnica e integración externa.
- **Criterio de alcance:** debe incorporarse sobre el flujo interno de ventas, no mediante un e-commerce público ni un carrito de compras para clientes, y solo como ampliación posterior al núcleo funcional.

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
18. El sistema deberá advertir posibles incompatibilidades entre componentes, sin impedir su selección o venta (RN-ARM-02 del BRD; advertencia informativa y no bloqueante, que no sustituye a la validación de completitud básica).
19. El stock de los componentes de un armado se verifica dos veces: al crear el presupuesto (disponibilidad informativa) y al confirmar la venta (disponibilidad real), porque puede haber cambiado en el medio.
20. Un armado puede asociarse a un presupuesto únicamente cuando se encuentra en estado `FINALIZADO`.
21. Los componentes de un armado no se duplican en el detalle del presupuesto; la PC armada se referencia desde el armado hacia el presupuesto, y sus componentes se mantienen únicamente en el armado.

### Productos y baja lógica

22. Un producto no puede eliminarse del catálogo si tiene movimientos asociados (compras, ventas o armados) — solo puede darse de baja (soft delete), para no romper la trazabilidad histórica.
23. El mismo criterio de baja lógica aplica a clientes, proveedores y usuarios cuando corresponda, evitando eliminar físicamente información histórica.

### Pagos

24. La información de pago debe mantenerse separada conceptualmente de la venta: una Venta representa la operación comercial y un Pago representa el intento/resultado de cobrarla.
25. El **pago simulado** forma parte del MVP: permite registrar internamente el cobro de una venta mediante un medio de pago simulando (efectivo, transferencia o tarjeta), sin interactuar con servicios externos. Registra el monto y el resultado del cobro.
26. El pago simulado **no reserva stock**: el descuento de stock continúa perteneciendo a la operación de venta.
27. La incorporación de un medio de pago externo (Mercado Pago) es una **extensión opcional**. No debe alterar las reglas fundamentales de venta y stock; el flujo deberá poder evolucionar hacia nuevos medios de pago sin rediseñar el núcleo de ventas.
28. La reserva de stock vinculada a un pago permanece fuera del MVP y no forma parte de las extensiones principales. Si llegara a implementarse en una evolución futura, deberá distinguir stock total, reservado y disponible, y liberar una reserva cuando corresponda según el estado de la operación.

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

Pago                          (pago simulado — MVP)
- id
- ventaId                     (FK -> Venta)
- medioPago                   (efectivo | transferencia | tarjeta — simulados)
- estado
- monto
- fecha

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
- **Venta ↔ Pago:** 1 → 0..1. Una venta puede tener asociado un pago (simulado). La cardinalidad definitiva se valida al definir el flujo de pago; la separación conceptual Venta ↔ Pago se mantiene.

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

### Pago (simulado)

- `PENDIENTE`: el cobro fue registrado pero aún sin confirmar su resultado.
- `CONFIRMADO`: el cobro se registró como realizado.
- `RECHAZADO`: el intento de cobro resultó fallido.

Los estados del pago simulado son conceptuales y pueden refinarse en el BRD. Los estados de una eventual integración con Mercado Pago se definen únicamente si dicha extensión se implementa.

---

## 9. Alcance

### 9.1 Alcance obligatorio / MVP

Funcionalidades que deben estar implementadas para considerar terminado el proyecto:

- Autenticación con dos roles (administrador, vendedor).
- Gestión de productos y categorías.
- Gestión de clientes y proveedores.
- Compras con detalle de productos (incrementa stock al confirmarse).
- Ventas con detalle de productos (descuenta stock), incluyendo venta directa sin presupuesto.
- Presupuestos: creación, conversión a venta, estados (incluyendo vencimiento).
- Armado de PCs: selección de componentes, validación de completitud básica y de stock, integrado con presupuestos/ventas.
- Pago simulado: registro del cobro de una venta mediante un medio de pago interno, sin interactuar con servicios externos.

Los diferenciadores principales del proyecto son **Presupuestos** y **Armado de PCs**. El pago simulado cierra el flujo comercial sin depender de un proveedor externo.

### 9.2 Evolución del sistema

Funcionalidades menores que podrían incorporarse posteriormente si corresponde, sin ser necesarias para completar el MVP:

- Marca como entidad propia (en lugar de campo de texto).
- Dashboard con métricas adicionales (productos más vendidos, comparativas).

### 9.3 Extensiones opcionales — propuestas de ampliación

Las siguientes extensiones no forman parte de los requisitos obligatorios del proyecto. Su implementación es opcional y su ausencia no implica incumplimiento del alcance definido. Representan ampliaciones futuras que pueden incorporarse una vez completado el núcleo funcional, incrementando progresivamente la complejidad funcional y técnica del sistema.

Ver sección 15 para el detalle de cada extensión.

### 9.4 Fuera de alcance

- E-commerce con carrito de compras público y checkout para clientes.
- Facturación real / integración con AFIP.
- Otros proveedores de pago distintos de Mercado Pago.
- Funciones propias de una plataforma financiera, conciliación bancaria o gestión financiera avanzada.
- Compatibilidad técnica avanzada de hardware (sockets, chipsets, cálculo de wattage).
- Generación de imágenes (renders de la PC armada).
- Importación automática de catálogos de proveedores.
- Múltiples sucursales.

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

POST   /ventas/:id/pago             (registro del pago simulado de una venta)
GET    /pagos/:id

GET    /dashboard/resumen
```

---

## 12. Complejidad general

**Clasificación: medio.**

Es un escalón más complejo que un sistema de stock simple, porque tiene **varias entidades de detalle** (CompraDetalle, VentaDetalle, PresupuestoDetalle, ArmadoComponente) que implican relaciones N:M reales, más una máquina de estados (Presupuesto, y estados para Compra, Venta, Armado y Pago simulado) y una regla de completitud/validación (Armado). El MVP no depende de integraciones externas ni de módulos de post-venta obligatorios. Si se incorpora Mercado Pago como extensión opcional, la complejidad aumenta por la integración externa, los estados de pago y la necesidad de mantener consistencia entre venta, pago y stock.

**Módulos más difíciles de implementar:**
- **Armado de PCs:** tanto la lógica de validación (categorías obligatorias + stock) como el frontend para seleccionar componentes de múltiples categorías de forma clara.
- **Presupuestos → Ventas:** el manejo de estados y la conversión (recalcular stock/precios al confirmar) requiere cuidado para no duplicar lógica con las ventas directas.
- **Compras y Ventas con detalle:** los formularios de "múltiples ítems" (agregar/quitar productos con cantidad y precio) son, en la práctica, la parte de frontend que más tiempo suele llevar, incluso siendo conceptualmente simple.

---

## 13. Riesgos de alcance

- **Pagos online / integración con Mercado Pago:** no forman parte del MVP v1.0; son una extensión opcional. Requieren credenciales de proveedor, integración con API, manejo de estados de transacción y eventualmente webhooks. La integración deberá apoyarse sobre el modelo de Venta/Pago ya definido en el MVP.
- **Reserva de stock asociada al pago:** se considera una posible evolución futura, fuera de las extensiones principales. La dificultad está en mantener consistencia entre stock disponible, stock reservado y estado del pago, especialmente ante vencimientos, rechazos, reintentos o concurrencia.
- **Envíos / logística:** no forman parte del MVP; son una extensión opcional. La complejidad radica en incorporar un dominio de entrega con entidades y estados propios, ajeno al núcleo de ventas.
- **Facturación real / integración con AFIP:** fuera de alcance — tiene validez fiscal real y reglas propias de un sistema de facturación electrónica; totalmente desproporcionado para el objetivo académico.
- **E-commerce / carrito de compras público:** fuera de alcance — implicaría un frontend público completo, sesiones de invitados y checkout, prácticamente un segundo sistema.
- **Compatibilidad avanzada de hardware:** fuera de alcance — validar sockets, chipsets o cálculo de consumo (wattage) real requeriría mantener una base de datos de especificaciones técnicas por componente y reglas de matching; es un proyecto de datos en sí mismo. Se mantiene solo la validación de completitud básica (sección 6, regla 17), sumada a la advertencia no bloqueante de posibles incompatibilidades entre componentes (sección 6, regla 18).
- **Generación de imágenes** (por ejemplo, un render de la PC armada): fuera de alcance — es contenido multimedia, no aporta al análisis de sistemas.
- **Importación automática de catálogos de proveedores:** fuera de alcance — implica parsers para formatos externos variables (Excel, XML, APIs de terceros) que no son parte del dominio del proyecto.
- **Múltiples sucursales:** fuera de alcance — multiplicaría stock, compras y ventas por sucursal sin aportar valor proporcional a un proyecto individual.

Si en algún momento del desarrollo aparece la tentación de sumar alguno de estos puntos, es señal de que el alcance se está corriendo del objetivo académico original.

---

## 14. Versionado y roadmap de implementación

El proyecto se plantea como una evolución por versiones para mantener el alcance controlado y, al mismo tiempo, demostrar que el diseño puede crecer sin rehacer el sistema. El roadmap obligatorio **termina en el MVP**; las funcionalidades posteriores se documentan como ampliaciones opcionales, no como etapas comprometidas.

| Versión | Objetivo | Estado esperado |
|---|---|---|
| **v0.1** | Fundaciones: estructura frontend/backend, base de datos, modelo inicial, manejo de errores y autenticación base | Base técnica |
| **v0.2** | Usuarios, roles, productos y categorías | Planificada |
| **v0.3** | Clientes, proveedores, compras y actualización de stock | Planificada |
| **v0.4** | Ventas y presupuestos | Planificada |
| **v0.5** | Armado de PCs e integración completa con presupuestos/ventas | Planificada |
| **v1.0** | MVP completo, integración, validaciones, pago simulado, UX, pruebas y documentación | **Objetivo obligatorio** |

### Posibles extensiones futuras

Más allá del MVP, se contemplan ampliaciones opcionales numeradas por dificultad (detalladas en la sección 15). No cuentan con una versión obligatoria dentro del roadmap:

1. Kardex / historial de movimientos de stock.
2. Garantías y devoluciones.
3. Envíos y logística.
4. Integración con Mercado Pago.

Cada requerimiento funcional que se derive de este documento deberá poder asociarse a una etapa y a un estado. Como criterio de trazabilidad se recomienda utilizar, como mínimo: **RF → módulo → etapa → estado**. Los estados pueden ser `Obligatorio`, `Evolución`, `Extensión opcional` o `Fuera de alcance`.

### 14.1 Criterio de escalabilidad

El sistema deberá permitir la incorporación progresiva de nuevas funcionalidades y módulos sin alterar de manera significativa las funcionalidades existentes. Esto se refleja especialmente en la separación conceptual entre Venta y Pago: la venta constituye el núcleo comercial y el pago puede evolucionar desde un registro interno simulado (MVP) hasta una integración con Mercado Pago y, eventualmente, otros medios, como ampliación opcional.

La escalabilidad también se contempla para las extensiones opcionales de kardex, garantías/devoluciones y envíos/logística, así como para una eventual reserva de stock. Esta capacidad debe entenderse como **diseño preparado para ampliación**, no como obligación de implementar todas esas funcionalidades durante el proyecto.

### 14.2 Decisiones de negocio todavía pendientes

Para evitar que el BRD o FRD introduzcan decisiones no acordadas, quedan deliberadamente abiertas las siguientes definiciones.

Respecto del pago simulado (MVP) queda por precisar únicamente:

- los medios de pago simulados concretos y sus valores de estado definitivos.

Respecto de la integración con Mercado Pago (extensión opcional), y solo en caso de decidir implementarla, permanecen pendientes:

- Quién inicia el pago y desde qué pantalla o flujo.
- Si la Venta se crea antes del intento de pago o como resultado de una operación de pago.
- En qué momento exacto se considera confirmado el pago.
- Estados definitivos de `Pago` externo y transiciones permitidas.
- Qué ocurre ante pago rechazado, cancelado, abandonado o fallido.
- Si se permiten reintentos y bajo qué condiciones.
- Uso de webhook, consulta directa al proveedor o combinación de ambos para confirmar el resultado.
- Datos exactos de Mercado Pago que deberán persistirse y cuáles solo se consultarán externamente.

Respecto de una eventual reserva de stock (evolución futura):

- Duración y condiciones de una reserva.

Respecto del dominio en general:

- El valor de "X días" que determina el vencimiento de un presupuesto (parámetro de `fechaVencimiento`).

Estas decisiones **no deben ser inventadas** al redactar el BRD/FRD. Deben quedar como pendientes hasta que se definan explícitamente.

---

## 15. Extensiones opcionales — propuestas de ampliación

> Las siguientes extensiones no forman parte de los requisitos obligatorios del proyecto. Su implementación es opcional y su ausencia no implica incumplimiento del alcance definido. Representan ampliaciones futuras que pueden incorporarse una vez completado el núcleo funcional, incrementando progresivamente la complejidad funcional y técnica del sistema. Se ordenan por dificultad relativa al proyecto completo; no constituyen especificaciones funcionales completas.

### Extensión 1 — Kardex / historial de movimientos de stock

- **Objetivo / problema que resuelve:** dotar de trazabilidad al stock, registrando por qué y cuándo se produjo cada variación de existencias.
- **Principales funcionalidades:** registro de movimientos de stock con producto, tipo de movimiento (entrada/salida), cantidad, motivo/origen y fecha; consulta del historial por producto.
- **Impacto sobre el modelo de datos:** incorpora una entidad de movimientos de stock derivada automáticamente de operaciones ya existentes, sin rediseñar el núcleo.
- **Módulos afectados:** Stock (Producto), Compras, Ventas, Armados.
- **Dependencias:** se apoya sobre las operaciones de compra, venta y armado ya implementadas en el MVP.
- **Principales desafíos:** registrar cada movimiento de forma transaccional junto a la operación que lo origina, sin duplicar información ni romper la coherencia del stock.
- **Por qué amplía el sistema:** agrega una capa de auditoría/historial de bajo costo que demuestra la capacidad de evolución del modelo, sin introducir reglas de negocio complejas.

### Extensión 2 — Garantías y devoluciones

- **Objetivo / problema que resuelve:** gestionar la postventa, dando soporte a devoluciones y su efecto sobre el inventario.
- **Principales funcionalidades:** registro de una devolución asociada a una venta, con motivo, estado y resolución; reincorporación condicional del producto al stock según corresponda.
- **Impacto sobre el modelo de datos:** incorpora una entidad de devolución/garantía y nuevas reglas que vinculan venta y stock.
- **Módulos afectados:** Ventas, Stock, Clientes.
- **Dependencias:** requiere que la operación de venta y su detalle histórico estén implementados.
- **Principales desafíos:** definir una máquina de estados de devolución y una regla condicional de reincorporación de stock (apto para reventa vs. baja).
- **Por qué amplía el sistema:** extiende el sistema hacia la postventa, una dimensión real del negocio, con reglas no triviales sobre stock.

### Extensión 3 — Envíos y logística

- **Objetivo / problema que resuelve:** cubrir la entrega de las ventas una vez concretadas, un aspecto ausente del núcleo.
- **Principales funcionalidades:** gestión de envíos asociados a una venta, estados del envío, datos básicos de entrega, asignación y seguimiento básico. Eventualmente, puntos/nodos de distribución o entrega como posible incorporación dentro de esta extensión.
- **Impacto sobre el modelo de datos:** incorpora entidades y estados propios del dominio de entrega, ajeno al núcleo de ventas.
- **Módulos afectados:** Ventas (nuevo módulo de Envíos).
- **Dependencias:** requiere que la operación de venta esté implementada; funciona como una capa posterior a la venta.
- **Principales desafíos:** modelar un ciclo de vida de envío y, en su caso, una asignación básica, sin convertirse en una plataforma logística completa.
- **Por qué amplía el sistema:** incorpora un dominio nuevo (logística) con su propia complejidad, sin que exista un diseño previo de nodos o distribución en el proyecto.

### Extensión 4 — Integración con Mercado Pago

- **Objetivo / problema que resuelve:** cerrar el cobro de las ventas mediante un proveedor de pagos externo en lugar del pago simulado interno.
- **Principales funcionalidades:** creación/inicio de una operación de pago; comunicación con Mercado Pago; recepción y confirmación del resultado; tratamiento de estados de pago; asociación del resultado con la `Venta`; eventual uso de webhook y/o consulta al proveedor; manejo de pagos rechazados o fallidos; persistencia de identificadores externos cuando corresponda.
- **Impacto sobre el modelo de datos:** amplía la entidad `Pago` con información del proveedor externo, sin rediseñar la `Venta`.
- **Módulos afectados:** Pagos, Ventas (y Stock, en caso de incorporarse reservas en el futuro).
- **Dependencias:** se apoya sobre el modelo Venta → Pago ya definido en el MVP.
- **Principales desafíos:** integración con un servicio externo, consistencia entre Venta, Pago y Stock, y comunicación asincrónica (webhooks).
- **Por qué amplía el sistema:** representa la mayor complejidad técnica al sumar integración externa y estados de transacción; distingue claramente el pago simulado (MVP) del pago real (extensión).

> El flujo técnico definitivo de cada extensión — en particular de la integración con Mercado Pago — se decide únicamente si la extensión se implementa. En el alcance actual no se especifican estados, endpoints ni decisiones de diseño definitivas para estas ampliaciones.

---

## 16. Restricciones y dependencias relevantes

- El cliente **no** es usuario del sistema: no hay portal de autogestión ni carrito de compras propio.
- El stock es un atributo de Producto y se modifica como efecto secundario de compras, ventas y armados; no se contempla un rol o módulo de stock separado.
- Las operaciones de stock (incremento por compra, decremento por venta, reversión por cancelación) deben ejecutarse de forma consistente y transaccional.
- Los productos, clientes, proveedores y usuarios con movimientos asociados se dan de baja de forma lógica (soft delete), no se eliminan físicamente.
- `Armado` y `Presupuesto` son los principales elementos diferenciadores del sistema.
- El pago simulado forma parte del MVP; la integración con Mercado Pago es una extensión opcional.
- Mercado Pago, reserva de stock, garantías/devoluciones, kardex, envíos/logística y Marca como entidad son ampliaciones opcionales o evoluciones del sistema y no forman parte del MVP v1.0.
- El proyecto será desarrollado individualmente y debe mantenerse dentro de un alcance académico razonable.

---

## 17. Decisiones importantes que afectan el funcionamiento del sistema

1. **Armado autónomo:** la configuración de una PC es una entidad independiente que puede existir antes de asociarse a un presupuesto, y se asocia opcionalmente a un presupuesto solo cuando alcanza el estado `FINALIZADO`.
2. **Sin duplicación de componentes:** los componentes de un armado se registran una única vez en el armado; no se replican en el detalle del presupuesto.
3. **Conversión única:** un presupuesto puede generar como máximo una venta, preservando la trazabilidad histórica.
4. **Historial de precios:** los detalles de compra, presupuesto, venta y armado conservan `precioUnitario` al momento de la operación.
5. **Valores derivados:** `subtotal` y `total` se obtienen a partir de los detalles y los precios históricos, en lugar de tratarse como datos persistidos necesarios.
6. **Comportamiento de stock por estado:** las compras incrementan stock solo al confirmarse; las ventas decrementan al completarse y revierten al cancelarse.
7. **Pago simulado (MVP):** el cobro de una venta se registra internamente mediante un medio de pago simulado, separado conceptualmente de la operación de venta y sin servicios externos. El pago no reserva stock.

---

## 18. Propuesta final

El sistema tendrá como núcleo un conjunto de módulos obligatorios de gestión (productos/categorías, clientes, proveedores, compras, ventas, usuarios y pago simulado) más los dos diferenciadores de dominio (presupuestos y armado de PCs). Sobre ese núcleo completo y autosuficiente se describen ampliaciones opcionales que pueden incorporarse posteriormente.

El flujo central de la versión MVP será:

**Cliente → selección de componentes → armado de PC → presupuesto → conversión a venta → verificación de stock → descuento de stock → pago simulado.**

El pago simulado cierra el flujo comercial sin depender de un proveedor externo. La integración con Mercado Pago, los envíos/logística y las demás ampliaciones son extensiones opcionales que no condicionan la completitud del núcleo.

Esta propuesta prioriza:
1. **Terminabilidad:** v1.0 concentra el trabajo obligatorio y evita que las integraciones externas comprometan la entrega.
2. **Complejidad suficiente:** relaciones N:M, entidades de detalle, máquinas de estados, validaciones de negocio y un flujo de pago cerrado internamente.
3. **Identidad del dominio:** el armado de PCs y los presupuestos no son CRUD genéricos de stock.
4. **Ampliación controlada:** el modelo permite agregar Mercado Pago, envíos, kardex, garantías y otros módulos sin rediseñar el núcleo.
5. **Trazabilidad:** cada requerimiento puede vincularse con una etapa, módulo y estado.
6. **Viabilidad académica:** el objetivo principal continúa siendo un MVP completo y defendible desarrollado individualmente en aproximadamente 11 semanas, con ampliaciones opcionales que demuestran escalabilidad sin ser requisitos incumplidos.