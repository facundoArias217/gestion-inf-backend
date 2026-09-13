
# Decisiones Arquitectónicas del Proyecto

## 1. Propósito del documento

Este documento registra las principales decisiones técnicas y arquitectónicas adoptadas para el desarrollo del sistema web de gestión para una tienda de informática.

El proyecto será desarrollado individualmente y tiene como objetivo integrar los conocimientos adquiridos en las materias de Análisis de Sistemas, Backend con Node.js + Express y Frontend con React.

El documento complementa al documento de alcance funcional del proyecto (`alcance-informatica-v2.md`) y establece principalmente **cómo se construirá técnicamente el sistema**, sin reemplazar las definiciones funcionales y de negocio establecidas en dicho alcance.

Las decisiones podrán evolucionar durante el desarrollo cuando exista una justificación técnica o cuando nuevas versiones del sistema requieran ampliar la arquitectura.

---

# 2. Arquitectura general

## 2.1 Arquitectura en capas

El sistema utilizará una arquitectura en capas, buscando separar la presentación, la lógica de negocio y el acceso a los datos.

La arquitectura general será:

```text
Frontend
    ↓
API REST
    ↓
Backend
    ↓
Base de datos
```

El backend seguirá principalmente el siguiente flujo:

```text
Request
   ↓
Routes
   ↓
Middlewares
   ↓
Controllers
   ↓
Services
   ↓
Models
   ↓
Database
```

La respuesta recorrerá conceptualmente el camino inverso.

La separación de responsabilidades permitirá mantener el código organizado y facilitar la evolución del sistema a través de las distintas versiones previstas.

---

# 3. Separación entre Frontend y Backend

El frontend y el backend serán desarrollados como aplicaciones independientes.

Se utilizarán dos repositorios Git separados:

```text
informatica-frontend
informatica-backend
```

A nivel local podrán mantenerse dentro de una misma carpeta de trabajo:

```text
proyecto-integrador-informatica/
│
├── docs/
│
├── informatica-backend/
│
└── informatica-frontend/
```

La carpeta `docs/` contendrá documentación transversal al proyecto y no pertenecerá específicamente al frontend ni al backend.

El frontend no tendrá acceso directo a la base de datos. Toda comunicación con el backend se realizará mediante la API.

---

# 4. Backend

## 4.1 Tecnologías

El backend utilizará:

- Node.js
- Express
- Sequelize
- PostgreSQL
- API REST
- JSON
- JWT para autenticación

Se utilizarán tecnologías conocidas por el desarrollador siempre que sean suficientes para cumplir los objetivos del proyecto, evitando incorporar herramientas innecesariamente complejas que incrementen la curva de aprendizaje.

---

# 5. Flujo del Backend

El flujo principal de una solicitud será:

```text
Cliente / Frontend
       ↓
     Routes
       ↓
   Middlewares
       ↓
   Controllers
       ↓
    Services
       ↓
     Models
       ↓
    Database
```

## 5.1 Routes

Las rutas definirán los endpoints disponibles de la API y dirigirán las solicitudes hacia los controllers correspondientes.

No deberán contener lógica de negocio.

## 5.2 Middlewares

Los middlewares se utilizarán para tareas transversales que deban ejecutarse antes de llegar al controller.

Entre ellos se contemplan:

- autenticación mediante JWT;
- autorización mediante roles;
- validación de datos;
- manejo global de errores.

## 5.3 Controllers

Los controllers serán responsables de:

- recibir las solicitudes HTTP;
- obtener los datos de entrada;
- invocar los Services correspondientes;
- construir las respuestas HTTP.

Los controllers no deberán contener lógica de negocio compleja.

## 5.4 Services

Los Services concentrarán las reglas y operaciones de negocio.

Entre otras responsabilidades, podrán:

- verificar condiciones de negocio;
- consultar y modificar entidades;
- coordinar varias operaciones;
- controlar transacciones;
- ejecutar procesos que involucren múltiples entidades.

Ejemplos de reglas que pertenecen a esta capa:

- verificar que exista stock suficiente;
- determinar si un presupuesto puede convertirse en una venta;
- verificar que un presupuesto no esté vencido;
- controlar las condiciones para registrar una compra o una venta;
- coordinar la actualización del stock.

## 5.5 Models

Los Models representarán las entidades persistidas y encapsularán el acceso a los datos mediante Sequelize.

Los Models estarán relacionados con las tablas correspondientes de PostgreSQL.

---

# 6. Estructura inicial del Backend

La estructura propuesta será:

```text
src/
├── config/
│
├── controllers/
│
├── database/
│   └── models/
│
├── middlewares/
│
├── routes/
│
├── services/
│
├── validators/
│
└── app.js
```

La estructura podrá crecer durante el desarrollo si aparecen nuevas necesidades, pero no se incorporarán capas o carpetas adicionales sin una justificación.

---

# 7. Base de datos

## 7.1 Motor de base de datos

Se utilizará PostgreSQL como sistema gestor de base de datos.

La elección se realiza considerando que el proyecto posee múltiples entidades relacionadas y operaciones que requieren mantener consistencia entre varias modificaciones.

El uso de PostgreSQL también permite trabajar con características importantes para el proyecto, como relaciones, claves foráneas y transacciones.

## 7.2 ORM

El acceso a PostgreSQL se realizará mediante Sequelize.

Sequelize será responsable de proporcionar la capa de interacción entre la aplicación Node.js y la base de datos.

La elección de Sequelize prioriza el conocimiento previo del desarrollador y evita incorporar un ORM diferente durante el desarrollo del proyecto.

---

# 8. Validaciones

Las validaciones se distribuirán según su responsabilidad.

## 8.1 Frontend

El frontend podrá realizar validaciones para mejorar la experiencia del usuario.

Por ejemplo:

- campos obligatorios;
- formatos;
- valores evidentemente inválidos;
- cantidades incorrectas.

Estas validaciones no reemplazarán las validaciones del backend.

## 8.2 Backend

El backend será responsable de garantizar que los datos recibidos sean válidos antes de procesarlos.

Los validadores se integrarán al flujo de middlewares.

Ejemplo:

```text
Request
   ↓
Route
   ↓
Validator
   ↓
Controller
```

La validación de estructura y formato se diferenciará de las reglas de negocio.

## 8.3 Reglas de negocio

Las condiciones que requieran conocer el estado del sistema o de otras entidades serán responsabilidad de los Services.

Por ejemplo:

```text
Validator:
"cantidad debe ser un entero positivo"

Service:
"la cantidad solicitada no puede superar el stock disponible"
```

## 8.4 Base de datos

PostgreSQL complementará las validaciones mediante restricciones de integridad, como:

- claves primarias;
- claves foráneas;
- campos obligatorios;
- restricciones de integridad correspondientes al modelo.

Como criterio general:

```text
Frontend → mejora la experiencia
Backend  → garantiza la validez de la operación
BD       → protege la integridad de los datos
```

---

# 9. Manejo de errores

El backend utilizará un middleware global para centralizar el manejo de errores.

El flujo será:

```text
Service / Controller / Model
           ↓
         Error
           ↓
    Error Middleware
           ↓
     HTTP Response
```

Los Controllers no deberán implementar individualmente toda la lógica de tratamiento de errores.

La respuesta de error utilizará una estructura JSON consistente.

Ejemplo conceptual:

```json
{
  "error": "STOCK_INSUFICIENTE",
  "message": "No hay stock suficiente para el producto solicitado."
}
```

Se contemplarán, entre otros:

- errores de validación;
- errores de autenticación;
- errores de autorización;
- recursos inexistentes;
- incumplimiento de reglas de negocio;
- errores internos.

Como referencia general:

```text
400 → datos inválidos / operación no válida
401 → no autenticado
403 → autenticado pero sin permisos
404 → recurso inexistente
500 → error interno
```

Los errores internos no deberán exponer información sensible o detalles internos innecesarios al cliente.

---

# 10. Autenticación y autorización

## 10.1 Autenticación

La autenticación utilizará JWT (JSON Web Token).

El flujo será:

```text
Login
  ↓
Controller
  ↓
Auth Service
  ↓
Verificación de credenciales
  ↓
Generación del JWT
  ↓
Frontend
```

El frontend enviará posteriormente el token en las solicitudes protegidas mediante el encabezado:

```text
Authorization: Bearer <JWT>
```

## 10.2 Middleware de autenticación

Las rutas protegidas utilizarán un middleware encargado de:

- comprobar la existencia del token;
- validar el JWT;
- obtener la identidad del usuario;
- permitir o rechazar el acceso.

Conceptualmente:

```text
Request
   ↓
auth.middleware
   ↓
Token válido?
   ├── No → 401
   └── Sí
        ↓
     Controller
```

## 10.3 Autorización por roles

El sistema contemplará los roles definidos funcionalmente:

```text
ADMIN
VENDEDOR
```

La autorización se realizará mediante middleware.

Conceptualmente:

```text
Request
   ↓
Autenticación
   ↓
Autorización por rol
   ↓
Controller
```

Por ejemplo:

```text
POST /productos
ADMIN → permitido
VENDEDOR → rechazado
```

Mientras que determinadas operaciones de ventas podrán estar disponibles para ambos roles de acuerdo con las reglas funcionales del sistema.

La autorización no deberá quedar dispersa innecesariamente dentro de los controllers.

## 10.4 Contraseñas

Las contraseñas no se almacenarán en texto plano.

Se almacenarán utilizando un mecanismo de hash seguro.

Las contraseñas tampoco formarán parte del contenido del JWT.

El detalle de la librería concreta para hash y JWT se definirá durante la implementación.

---

# 11. Transacciones

Las operaciones que impliquen múltiples modificaciones relacionadas utilizarán transacciones para mantener la consistencia de los datos.

El flujo general será:

```text
BEGIN
   ↓
Operación 1
   ↓
Operación 2
   ↓
Operación 3
   ↓
COMMIT
```

Ante un error:

```text
BEGIN
   ↓
Operaciones
   ↓
Error
   ↓
ROLLBACK
```

Las transacciones serán gestionadas desde la capa de Services y se implementarán utilizando las capacidades de Sequelize.

## 11.1 Operaciones candidatas

Entre las operaciones que requerirán especial consideración se encuentran:

### Compra

```text
Crear Compra
    ↓
Crear CompraDetalle
    ↓
Actualizar Stock
    ↓
COMMIT
```

### Venta

```text
Crear Venta
    ↓
Crear VentaDetalle
    ↓
Actualizar Stock
    ↓
COMMIT
```

### Conversión de Presupuesto a Venta

```text
Verificar Presupuesto
    ↓
Verificar condiciones
    ↓
Crear Venta
    ↓
Crear Detalles
    ↓
Actualizar estados / stock
    ↓
COMMIT
```

No todas las operaciones de lectura requerirán una transacción. Las transacciones se utilizarán cuando sea necesario garantizar la atomicidad de una operación de negocio.

---

# 12. Frontend

## 12.1 Tecnología

El frontend utilizará:

- React
- Vite

La aplicación se comunicará exclusivamente con el backend mediante la API REST.

## 12.2 Organización conceptual

El frontend seguirá una separación de responsabilidades basada principalmente en:

```text
Pages
   ↓
Components
   ↓
Hooks / Contexts
   ↓
Services
   ↓
HTTP
   ↓
Backend
```

No se considerará obligatorio que absolutamente todas las operaciones sigan exactamente cada uno de estos pasos. La estructura representa las responsabilidades generales de cada parte.

## 12.3 Pages

Las Pages representarán las pantallas o vistas principales de la aplicación.

## 12.4 Components

Los Components contendrán elementos reutilizables de la interfaz y componentes específicos de determinadas funcionalidades.

## 12.5 Hooks y Contexts

Los Hooks permitirán encapsular lógica reutilizable.

Los Contexts se utilizarán cuando sea necesario compartir determinados estados globales de la aplicación.

No se utilizará Context de manera indiscriminada cuando un estado pueda resolverse localmente o mediante un hook.

## 12.6 Services

Los Services del frontend serán responsables de la comunicación con la API.

Las llamadas HTTP no deberán distribuirse innecesariamente entre múltiples componentes.

Conceptualmente:

```text
Component / Hook
       ↓
Frontend Service
       ↓
HTTP
       ↓
Backend API
```

---

# 13. API REST

El backend expondrá una API REST utilizando HTTP y JSON.

Los recursos principales estarán relacionados con las entidades definidas en el alcance funcional.

Ejemplos conceptuales:

```text
/api/auth
/api/productos
/api/categorias
/api/clientes
/api/proveedores
/api/compras
/api/ventas
/api/presupuestos
/api/armados
/api/usuarios
```

Los endpoints específicos y sus contratos se definirán durante el diseño de la API y deberán mantenerse alineados con el alcance funcional y el FRD.

No se definirán anticipadamente decisiones que todavía no hayan sido establecidas funcionalmente.

---

# 14. Modelo de dominio y persistencia

La arquitectura utilizará las entidades definidas en el alcance funcional del proyecto.

Entre las principales entidades se encuentran:

```text
Usuario
Categoria
Producto
Proveedor
Cliente

Compra
CompraDetalle

Presupuesto
PresupuestoDetalle

Venta
VentaDetalle

Armado
ArmadoComponente

Pago
```

La implementación concreta de relaciones, claves, restricciones y atributos se definirá durante el diseño de la base de datos.

Las entidades `Armado` y `Presupuesto` mantienen especial importancia porque forman parte de los principales elementos diferenciadores del sistema.

---

# 15. Diferenciadores funcionales y evolución arquitectónica

El sistema tendrá como elementos diferenciadores principales:

- armado/configuración de computadoras;
- generación y gestión de presupuestos.

El sistema deberá permitir incorporar progresivamente funcionalidades adicionales sin alterar de manera significativa las funcionalidades existentes.

La arquitectura deberá favorecer una evolución progresiva del sistema.

Una de las posibles evoluciones planteadas es:

```text
Venta
  ↓
Pago
  ↓
Stock
```

Posteriormente podría incorporarse una lógica más avanzada:

```text
Venta
  ↓
Reserva de stock
  ↓
Pago
  ↓
Confirmación
  ↓
Descuento o liberación de stock
```

Estas extensiones no forman parte necesariamente del MVP y no deberán implementarse anticipadamente si afectan el alcance establecido para una versión.

---

# 16. Mercado Pago

La integración con Mercado Pago se considera una funcionalidad planificada para una etapa posterior al MVP.

No se incorporará como requisito obligatorio de la primera versión funcional.

La arquitectura deberá evitar acoplar innecesariamente la entidad `Venta` con un proveedor de pagos específico.

Conceptualmente:

```text
Venta
  ↓
Pago
  ↓
Proveedor de pago
```

La entidad `Pago` permitirá mantener separada la información de la venta de los detalles específicos de un proveedor externo.

Las decisiones funcionales pendientes relacionadas con Mercado Pago no deberán ser inventadas durante la implementación.

Entre ellas se encuentran:

- quién inicia el pago;
- cuándo se crea la venta;
- cuándo se reserva o descuenta stock;
- estados definitivos del pago;
- comportamiento ante pagos rechazados o abandonados;
- política de reintentos;
- utilización de webhooks;
- datos externos que deberán almacenarse.

Estas decisiones deberán definirse antes de implementar el flujo correspondiente.

---

# 17. Reserva de stock

La reserva de stock se considera una posible evolución posterior.

El MVP utilizará el modelo de stock definido en el alcance actual.

Una futura evolución podría diferenciar:

```text
stockTotal
stockReservado
stockDisponible
```

Por ejemplo:

```text
Stock total:       3
Stock reservado:   2
Stock disponible:  1
```

La incorporación de reservas implicaría definir adicionalmente:

- duración de una reserva;
- expiración;
- liberación;
- confirmación;
- interacción con pagos;
- consistencia y concurrencia.

Por su complejidad, esta funcionalidad no se incorporará al MVP salvo que el avance del proyecto permita implementarla sin comprometer las funcionalidades principales.

---

# 18. Versionado y escalabilidad

El desarrollo se organizará mediante versiones e iteraciones progresivas.

El calendario definido en el alcance funcional es tentativo.

Las primeras iteraciones previstas son:

```text
V1 → 18/09/2026
V2 → 02/10/2026
V3 → 16/10/2026
V4 → 30/10/2026
V5 → 13/11/2026
V6 → 27/11/2026
```

Las fechas podrán modificarse de acuerdo con el calendario académico y el avance real del proyecto.

El MVP no estará obligado a coincidir con una versión específica. Podrá alcanzarse en V2, V3 o V4 dependiendo del progreso.

La prioridad será:

```text
Sistema funcional
      ↓
MVP estable
      ↓
Mejoras y complejidad adicional
      ↓
Versión final
```

La arquitectura deberá favorecer la incorporación futura de funcionalidades sin requerir una modificación significativa de los módulos ya existentes.

---

# 19. Principios arquitectónicos

Las decisiones anteriores se resumen en los siguientes principios:

1. **Separación de responsabilidades.**
2. **Lógica de negocio concentrada principalmente en Services.**
3. **Controllers simples y orientados a HTTP.**
4. **Acceso a datos mediante Models y Sequelize.**
5. **Base de datos PostgreSQL.**
6. **Validación en múltiples niveles según responsabilidad.**
7. **Autenticación mediante JWT.**
8. **Autorización mediante middleware y roles.**
9. **Manejo centralizado de errores.**
10. **Uso de transacciones para operaciones que requieran atomicidad.**
11. **Comunicación Frontend ↔ Backend mediante API REST.**
12. **Separación física de Frontend y Backend mediante repositorios independientes.**
13. **Evitar complejidad técnica innecesaria.**
14. **Preparar la arquitectura para evolución progresiva.**
15. **No implementar anticipadamente funcionalidades fuera del alcance de la versión correspondiente.**

---

# 20. Decisiones pendientes

Las siguientes decisiones quedan abiertas y deberán definirse antes de implementar las funcionalidades correspondientes:

### Autenticación

- librería concreta para hash de contraseñas;
- librería concreta para JWT;
- duración del token;
- estrategia de expiración/renovación.

### API

- contratos definitivos;
- formato definitivo de respuestas;
- formato definitivo de errores;
- paginación y filtros cuando correspondan.

### Base de datos

- estructura definitiva de tablas;
- relaciones;
- índices;
- restricciones;
- estrategia de migraciones.

### Mercado Pago

- flujo de inicio del pago;
- estados;
- webhooks;
- reintentos;
- relación exacta entre Venta y Pago;
- comportamiento del stock.

### Reserva de stock

- momento de creación;
- duración;
- expiración;
- liberación;
- confirmación.

Las decisiones pendientes no deberán ser inventadas por herramientas de asistencia o durante la generación automática de documentación. Deberán mantenerse como decisiones abiertas hasta ser definidas explícitamente.

---

# 21. Relación con la documentación funcional

La arquitectura técnica deberá mantenerse alineada con:

```text
alcance-informatica-v2.md
        ↓
BRD
        ↓
FRD
        ↓
Arquitectura
        ↓
Implementación
```

El alcance funcional define principalmente **qué debe hacer el sistema**.

El BRD y el FRD formalizan los requerimientos.

Este documento define principalmente **cómo se organizará técnicamente la solución**.

La implementación deberá respetar las restricciones y prioridades establecidas para cada versión.