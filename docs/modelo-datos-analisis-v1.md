# Modelo de Datos — Análisis del DER

## 1. Contexto del proyecto

### 1.1 Nombre del proyecto

**Sistema de Gestión para una Tienda de Productos Informáticos**

### 1.2 Repositorios

- Backend: `gestion-informatica-backend`
- Frontend: `gestion-informatica-frontend`

### 1.3 Objetivo del documento

Este documento tiene como objetivo establecer una **propuesta inicial del modelo de datos** del sistema para posteriormente analizar y validar el Diagrama Entidad-Relación (DER).

El documento no representa todavía el modelo definitivo de la base de datos. Las entidades, atributos, relaciones y cardinalidades propuestas deberán ser revisadas antes de implementar los modelos correspondientes en PostgreSQL mediante Sequelize.

---

# 2. Objetivo del análisis

El análisis deberá determinar:

- Qué entidades son necesarias para representar el dominio.
- Qué atributos principales debería tener cada entidad.
- Qué relaciones existen entre las entidades.
- Qué cardinalidad corresponde a cada relación.
- Qué relaciones N:M existen.
- Qué tablas intermedias son necesarias.
- Qué claves primarias y foráneas deberían existir.
- Qué restricciones de integridad deberían implementarse.
- Si existen entidades innecesarias o faltantes.
- Si alguna relación propuesta debería modelarse de otra manera.
- Qué decisiones del modelo todavía requieren definición.

El objetivo es obtener un modelo relacional coherente con el alcance funcional y las reglas de negocio del proyecto.

---

# 3. Tecnologías previstas

El modelo de datos será posteriormente implementado utilizando:

- **Base de datos:** PostgreSQL
- **ORM:** Sequelize
- **Backend:** Node.js + Express

La arquitectura del backend seguirá una separación por capas:

`Routes → Middlewares → Controllers → Services → Models → Database`

Los modelos de Sequelize representarán las entidades persistidas en la base de datos.

---

# 4. Alcance funcional relevante para el modelo

El sistema está orientado a la gestión interna de una tienda de productos informáticos.

El MVP contempla principalmente:

- Gestión de usuarios y roles.
- Gestión de categorías.
- Gestión de productos.
- Gestión de clientes.
- Gestión de proveedores.
- Gestión de compras.
- Gestión de ventas.
- Gestión de presupuestos.
- Armado/configuración de PCs.

El proceso diferencial del sistema consiste en permitir que un vendedor configure una PC utilizando productos disponibles, genere un presupuesto para un cliente y, si este es aceptado, pueda convertirse en una venta.

El sistema deberá controlar el stock durante las operaciones que correspondan.

---

# 5. Entidades candidatas

A continuación se presentan las entidades consideradas inicialmente.

## 5.1 Usuario

Representa a los usuarios internos que utilizan el sistema.

Roles previstos:

- ADMIN
- VENDEDOR

### Posibles atributos

- id
- nombre
- apellido
- email
- passwordHash
- rol
- activo
- createdAt
- updatedAt

### Consideraciones

La contraseña no deberá almacenarse en texto plano.

El rol será utilizado para determinar las operaciones que puede realizar cada usuario.

---

## 5.2 Categoria

Representa las categorías a las que pertenecen los productos informáticos.

Ejemplos:

- Procesador
- Motherboard
- Memoria RAM
- Placa de video
- Almacenamiento
- Fuente
- Gabinete
- Periféricos

### Posibles atributos

- id
- nombre
- descripcion
- activo
- createdAt
- updatedAt

### Consideraciones

Una categoría puede contener múltiples productos.

---

## 5.3 Producto

Representa los productos comercializados por la tienda.

Los componentes utilizados para armar una PC también son productos. No se plantea inicialmente una entidad separada para cada tipo de componente.

### Posibles atributos

- id
- nombre
- descripcion
- precio
- stock
- activo
- categoriaId
- createdAt
- updatedAt

### Consideraciones

El producto deberá estar asociado a una categoría.

El stock deberá controlarse en las operaciones de compra y venta.

No se deberá permitir vender productos sin stock suficiente.

Los productos que posean movimientos asociados no deberían eliminarse físicamente de la base de datos.

---

## 5.4 Proveedor

Representa a las empresas o personas que suministran productos a la tienda.

### Posibles atributos

- id
- razonSocial / nombre
- cuit
- email
- telefono
- direccion
- activo
- createdAt
- updatedAt

### Consideraciones

Un proveedor puede estar asociado a múltiples compras.

No se plantea inicialmente una tabla de catálogo de productos por proveedor.

La relación entre proveedores y productos puede quedar registrada indirectamente mediante las compras realizadas y sus detalles.

---

## 5.5 Cliente

Representa a las personas que solicitan presupuestos o realizan compras.

### Posibles atributos

- id
- nombre
- apellido
- dni
- email
- telefono
- direccion
- activo
- createdAt
- updatedAt

### Consideraciones

Un cliente puede tener múltiples presupuestos y múltiples ventas.

---

# 6. Operaciones de compra

## 6.1 Compra

Representa una operación mediante la cual la tienda adquiere productos de un proveedor.

### Posibles atributos

- id
- proveedorId
- usuarioId
- fecha
- total
- estado
- createdAt
- updatedAt

### Consideraciones

Una compra pertenece a un proveedor.

Una compra es registrada por un usuario.

Una compra puede contener múltiples productos.

La confirmación de una compra deberá incrementar el stock correspondiente.

---

## 6.2 CompraDetalle

Representa los productos incluidos dentro de una compra.

### Posibles atributos

- id
- compraId
- productoId
- cantidad
- precioUnitario
- subtotal

### Consideraciones

Una compra posee uno o varios detalles.

Cada detalle corresponde a un único producto.

La entidad permite representar una relación de múltiples productos dentro de una compra sin almacenar una lista de productos directamente en la tabla Compra.

---

# 7. Presupuestos

## 7.1 Presupuesto

Representa una propuesta de venta realizada para un cliente.

### Posibles atributos

- id
- clienteId
- usuarioId
- fecha
- fechaVencimiento
- total
- estado
- createdAt
- updatedAt

### Posibles estados

Los estados concretos deberán validarse durante el análisis.

Podrían existir estados conceptuales como:

- PENDIENTE
- ACEPTADO
- RECHAZADO
- VENCIDO
- CONVERTIDO

No se debe asumir que estos estados son definitivos.

### Consideraciones

Un presupuesto pertenece a un cliente.

Un presupuesto es generado por un usuario.

Un presupuesto puede contener múltiples productos.

Un presupuesto aceptado puede convertirse posteriormente en una venta.

Un presupuesto vencido no debería poder convertirse directamente en una venta sin la correspondiente actualización/revalidación según las reglas que se definan.

---

## 7.2 PresupuestoDetalle

Representa los productos incluidos en un presupuesto.

### Posibles atributos

- id
- presupuestoId
- productoId
- cantidad
- precioUnitario
- subtotal

### Consideraciones

Un presupuesto posee múltiples detalles.

Cada detalle corresponde a un producto.

El precio unitario debería conservarse en el detalle para mantener el valor histórico del presupuesto.

---

# 8. Ventas

## 8.1 Venta

Representa una operación de venta realizada por la tienda.

### Posibles atributos

- id
- clienteId
- usuarioId
- presupuestoId (opcional, si la venta proviene de un presupuesto)
- fecha
- total
- estado
- createdAt
- updatedAt

### Consideraciones

Una venta pertenece a un cliente.

Una venta es registrada por un usuario.

Una venta puede originarse a partir de un presupuesto.

La venta deberá verificar nuevamente el stock antes de confirmar la operación.

Una venta confirmada deberá decrementar el stock correspondiente.

Una venta que proviene de un presupuesto no debería permitir modificar retroactivamente el presupuesto original.

---

## 8.2 VentaDetalle

Representa los productos incluidos en una venta.

### Posibles atributos

- id
- ventaId
- productoId
- cantidad
- precioUnitario
- subtotal

### Consideraciones

Una venta posee múltiples detalles.

Cada detalle corresponde a un producto.

El precio unitario debe conservarse para mantener el valor histórico de la venta.

---

# 9. Armado de PC

## 9.1 Armado

Representa una configuración de PC realizada dentro del sistema.

El armado es uno de los elementos diferenciadores del proyecto.

### Posibles atributos

- id
- usuarioId
- clienteId (opcional, según definición del flujo)
- presupuestoId (opcional, según definición del flujo)
- nombre / descripcion
- total
- estado
- createdAt
- updatedAt

### Consideraciones

Un armado está compuesto por productos.

Los productos utilizados en un armado deben pertenecer a categorías determinadas como obligatorias para una configuración básica.

El sistema realizará validaciones básicas de composición, pero no se contempla inicialmente un sistema avanzado de compatibilidad de hardware.

---

## 9.2 ArmadoComponente

Representa cada producto utilizado dentro de un armado de PC.

### Posibles atributos

- id
- armadoId
- productoId
- cantidad
- precioUnitario
- subtotal

### Consideraciones

Un armado puede contener múltiples productos.

Un producto puede participar en múltiples armados.

Por lo tanto, existe una relación N:M entre Armado y Producto que requiere una entidad intermedia.

---

# 10. Pago

## 10.1 Estado dentro del proyecto

**POST-MVP / PLANIFICADO**

La integración con Mercado Pago no forma parte del MVP actual.

Se prevé que posteriormente el sistema pueda incorporar pagos online.

Por este motivo, se contempla conceptualmente una entidad `Pago`, pero no se deberán cerrar todavía todos sus atributos ni su flujo de negocio.

### Posibles atributos futuros

- id
- ventaId
- medioPago
- estado
- monto
- fecha
- identificadorExterno
- createdAt
- updatedAt

Estos atributos son únicamente una propuesta inicial y deberán revisarse cuando se defina el flujo de integración con Mercado Pago.

---

# 11. Relaciones candidatas

Las siguientes relaciones se consideran inicialmente.

## Usuario

```text
Usuario 1 ───── N Compra
Usuario 1 ───── N Venta
Usuario 1 ───── N Presupuesto
Usuario 1 ───── N Armado
```

Un usuario puede registrar múltiples operaciones.

---

## Categoria y Producto

```text
Categoria 1 ───── N Producto
```

Una categoría puede contener múltiples productos.

Cada producto pertenece inicialmente a una categoría.

---

## Proveedor y Compra

```text
Proveedor 1 ───── N Compra
```

Un proveedor puede tener múltiples compras asociadas.

Cada compra corresponde a un proveedor.

---

## Compra y CompraDetalle

```text
Compra 1 ───── N CompraDetalle
```

Una compra puede contener múltiples detalles.

Cada detalle pertenece a una compra.

---

## Producto y CompraDetalle

```text
Producto 1 ───── N CompraDetalle
```

Un producto puede aparecer en múltiples compras a lo largo del tiempo.

Cada detalle corresponde a un producto.

Por lo tanto:

```text
Compra N ───── M Producto
```

La relación N:M se resuelve mediante:

```text
CompraDetalle
```

---

## Cliente y Presupuesto

```text
Cliente 1 ───── N Presupuesto
```

Un cliente puede recibir múltiples presupuestos.

Cada presupuesto corresponde a un cliente.

---

## Presupuesto y PresupuestoDetalle

```text
Presupuesto 1 ───── N PresupuestoDetalle
```

---

## Producto y PresupuestoDetalle

```text
Producto 1 ───── N PresupuestoDetalle
```

Por lo tanto:

```text
Presupuesto N ───── M Producto
```

La relación N:M se resuelve mediante:

```text
PresupuestoDetalle
```

---

## Cliente y Venta

```text
Cliente 1 ───── N Venta
```

Un cliente puede realizar múltiples compras/ventas.

---

## Venta y VentaDetalle

```text
Venta 1 ───── N VentaDetalle
```

---

## Producto y VentaDetalle

```text
Producto 1 ───── N VentaDetalle
```

Por lo tanto:

```text
Venta N ───── M Producto
```

La relación N:M se resuelve mediante:

```text
VentaDetalle
```

---

## Armado y Producto

```text
Armado N ───── M Producto
```

La relación N:M se resuelve mediante:

```text
ArmadoComponente
```

---

## Presupuesto y Venta

Existe una relación conceptual entre ambas entidades:

```text
Presupuesto ───── Venta
```

Una venta puede originarse a partir de un presupuesto.

La cardinalidad y la forma exacta de implementar esta relación deberán analizarse.

Una posibilidad inicial es:

```text
Venta 1 ───── 0..1 Presupuesto
```

utilizando `presupuestoId` en Venta, pero esto debe ser validado.

---

## Armado y Presupuesto

Puede existir una relación entre el armado de una PC y el presupuesto generado a partir de dicho armado.

La forma exacta de representar esta relación deberá analizarse según el flujo definitivo del sistema.

No debe asumirse todavía una cardinalidad definitiva.

---

# 12. Tablas intermedias / de detalle candidatas

Las siguientes entidades cumplen inicialmente la función de resolver relaciones entre una operación y sus productos:

| Tabla | Relación que representa |
|---|---|
| CompraDetalle | Compra ↔ Producto |
| PresupuestoDetalle | Presupuesto ↔ Producto |
| VentaDetalle | Venta ↔ Producto |
| ArmadoComponente | Armado ↔ Producto |

Estas entidades también permiten almacenar información propia de la relación, como:

- cantidad
- precio unitario
- subtotal

Por lo tanto, no son simplemente tablas técnicas para resolver N:M, sino que representan información relevante de cada operación.

---

# 13. Reglas de negocio que afectan al modelo

El modelo de datos deberá ser compatible, como mínimo, con las siguientes reglas:

### Stock

- No se debe permitir realizar una venta si no existe stock suficiente.
- Las compras incrementan el stock.
- Las ventas decrementan el stock.
- La creación de un presupuesto debe contemplar una validación de stock.
- La confirmación de la venta debe volver a validar el stock.
- La reserva de stock no forma parte del MVP.

### Presupuestos

- Un presupuesto pertenece a un cliente.
- Un presupuesto es generado por un usuario.
- Un presupuesto contiene productos y cantidades.
- El precio del producto en el presupuesto debe conservarse históricamente.
- Un presupuesto aceptado puede convertirse en una venta.
- Un presupuesto vencido no debe convertirse directamente sin la correspondiente actualización/revalidación.
- Una venta convertida no debe modificar retroactivamente el presupuesto original.

### Armados

- Un armado está compuesto por productos.
- Deben existir determinadas categorías obligatorias para una configuración básica.
- El sistema realizará validaciones básicas.
- No se implementará inicialmente compatibilidad avanzada entre componentes.

### Productos

- Los productos pertenecen a categorías.
- Los productos que posean movimientos asociados no deberían eliminarse físicamente.
- Se deberá considerar el uso de baja lógica mediante un campo como `activo`.

### Integridad

Las relaciones deberán respetar claves primarias y foráneas.

Las restricciones de integridad que puedan garantizarse desde PostgreSQL deberán definirse en la base de datos además de las validaciones realizadas desde el backend.

---

# 14. Consideraciones sobre historial

Las entidades que representan operaciones comerciales deben conservar información histórica.

En particular:

- CompraDetalle debe conservar el precio al momento de la compra.
- PresupuestoDetalle debe conservar el precio utilizado en el presupuesto.
- VentaDetalle debe conservar el precio utilizado en la venta.

No se debe depender exclusivamente del precio actual almacenado en Producto para reconstruir operaciones históricas.

---

# 15. Transacciones

Algunas operaciones del sistema implicarán múltiples modificaciones relacionadas.

Por ejemplo:

### Compra

```text
Crear Compra
    ↓
Crear CompraDetalle
    ↓
Actualizar stock
    ↓
COMMIT
```

### Venta

```text
Crear Venta
    ↓
Crear VentaDetalle
    ↓
Actualizar stock
    ↓
COMMIT
```

### Conversión de Presupuesto a Venta

```text
Validar presupuesto
    ↓
Validar condiciones
    ↓
Validar stock
    ↓
Crear Venta
    ↓
Crear VentaDetalle
    ↓
Actualizar estado correspondiente
    ↓
Actualizar stock
    ↓
COMMIT
```

Estas operaciones deberán utilizar transacciones de PostgreSQL mediante Sequelize para evitar estados inconsistentes ante errores.

---

# 16. Decisiones que todavía NO están cerradas

El análisis no debe inventar decisiones sobre los siguientes puntos:

### 16.1 Estados

Todavía deben definirse formalmente los estados de:

- Compra
- Presupuesto
- Venta
- Armado
- Pago

### 16.2 Presupuesto → Venta

Debe determinarse:

- Si una venta puede existir sin presupuesto.
- Si un presupuesto puede generar como máximo una venta.
- Si una venta conserva referencia al presupuesto.
- Qué ocurre con el presupuesto una vez convertido.

### 16.3 Armado → Presupuesto

Debe determinarse:

- Si todo armado necesariamente genera un presupuesto.
- Si un presupuesto puede contener un armado.
- Si el armado se conserva como entidad histórica luego de generar el presupuesto.
- Cómo se relacionan exactamente Armado, ArmadoComponente y PresupuestoDetalle.

### 16.4 Cliente en Armado

Debe determinarse si un armado:

- pertenece directamente a un cliente;
- pertenece únicamente al usuario que lo creó;
- o solamente adquiere relación con un cliente cuando se genera el presupuesto.

### 16.5 Pago

Mercado Pago es una funcionalidad post-MVP.

No se deben definir todavía como definitivos:

- estados del pago;
- momento de creación del pago;
- momento de creación de la venta;
- comportamiento ante pagos rechazados;
- comportamiento ante pagos abandonados;
- reintentos;
- webhook o consulta directa;
- identificadores externos definitivos;
- relación exacta entre Pago y Venta.

### 16.6 Reserva de stock

La reserva de stock es una funcionalidad futura.

No forma parte del modelo MVP actual.

---

# 17. Aspectos que OpenCode debe analizar

OpenCode deberá revisar críticamente esta propuesta.

No debe limitarse a repetir el contenido del documento.

Deberá identificar:

1. Entidades faltantes.
2. Entidades innecesarias.
3. Relaciones incorrectas.
4. Cardinalidades incorrectas.
5. Relaciones N:M que no estén correctamente resueltas.
6. Tablas intermedias que falten.
7. Tablas intermedias que no sean necesarias.
8. Atributos que deberían ser obligatorios.
9. Atributos que deberían ser opcionales.
10. Posibles claves primarias.
11. Posibles claves foráneas.
12. Restricciones de unicidad.
13. Restricciones de integridad referencial.
14. Posibles problemas de normalización.
15. Problemas derivados del manejo de historial.
16. Problemas relacionados con stock.
17. Problemas relacionados con la conversión Presupuesto → Venta.
18. Problemas relacionados con Armado → Producto.
19. Posibles inconsistencias entre las relaciones propuestas y las reglas de negocio.
20. Qué decisiones deberían cerrarse antes de implementar Sequelize.

---

# 18. Restricciones para el análisis

El análisis deberá respetar las siguientes restricciones:

- No agregar funcionalidades comerciales que no estén contempladas en el alcance.
- No convertir el proyecto en un e-commerce público.
- No incorporar múltiples sucursales.
- No incorporar envíos.
- No incorporar AFIP.
- No incorporar catálogos externos de proveedores.
- No implementar compatibilidad avanzada de hardware.
- No incorporar reserva de stock al MVP.
- No incorporar Mercado Pago como funcionalidad del MVP.
- No crear una entidad diferente para cada tipo de componente informático.
- No agregar entidades solamente por seguir patrones arquitectónicos innecesarios.

El proyecto será desarrollado individualmente y debe mantenerse dentro de un alcance académico razonable.

---

# 19. Resultado esperado

Como resultado del análisis se espera obtener:

## 19.1 Entidades definitivas propuestas

Listado de entidades recomendadas, indicando cuáles forman parte del MVP y cuáles son futuras.

## 19.2 Atributos

Para cada entidad:

- nombre
- propósito
- atributos
- tipo de dato sugerido
- PK
- FK
- obligatoriedad
- restricciones relevantes

## 19.3 Relaciones

Para cada relación:

- entidad origen
- entidad destino
- cardinalidad
- explicación
- FK involucrada

## 19.4 Relaciones N:M

Listado explícito de todas las relaciones N:M detectadas y la tabla intermedia correspondiente.

## 19.5 Integridad y normalización

Indicar:

- restricciones recomendadas;
- índices relevantes;
- unicidad;
- integridad referencial;
- posibles problemas de normalización.

## 19.6 Observaciones

Separar claramente:

- decisiones confirmadas;
- recomendaciones;
- problemas detectados;
- decisiones pendientes.

## 19.7 Preparación para Sequelize

Finalmente, indicar cómo debería traducirse conceptualmente el modelo validado a:

- modelos Sequelize;
- asociaciones (`hasMany`, `belongsTo`, `belongsToMany`, etc.);
- claves foráneas;
- tablas intermedias.

**No implementar código todavía.**

---

# 20. Flujo de trabajo posterior

Una vez validado este análisis, el desarrollo del modelo seguirá aproximadamente este flujo:

```text
Modelo de datos — análisis
        ↓
Revisión de OpenCode
        ↓
Correcciones y decisiones
        ↓
DER definitivo
        ↓
Modelo relacional
        ↓
Modelos Sequelize
        ↓
Migraciones
        ↓
Implementación de Services
```

El DER definitivo deberá representar únicamente las decisiones que hayan sido validadas después de este análisis.