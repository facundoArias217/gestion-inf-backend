---
name: serializacion-respuestas
description: Regla de serialización de respuestas del backend. Consultar al implementar controllers o services de cualquier endpoint: las respuestas se arman con un DTO/serializer explícito en src/serializers/, nunca se devuelve la instancia del ORM directamente, y los campos se filtran según el rol cuando el BRD lo requiera.
---

# Serialización de respuestas (DTO)

Regla transversal a todas las tarjetas [BE]. Fuente de verdad de los shapes: `docs/modelo-datos-analisis-v1.md`.

---

## Regla principal

- **Nunca se devuelve la instancia del ORM directamente** (`Usuario`, `Producto`, etc. ni sus variantes `toJSON()`), ni se usa un `delete`/blacklist sobre la instancia serializada.
- **Toda respuesta se arma con un DTO/serializer explícito**: un serializer por entidad en `src/serializers/`, con **whitelist** de campos (solo los que el contrato pide; agregar campos requiere decisión del contrato, no al revés).

```js
const { serializarProducto } = require('../serializers/producto.serializer');

return res.status(200).json({ message: '...', data: serializarProducto(producto) });
```

## Estructura

- Un archivo por entidad: `src/serializers/usuario.serializer.js`, `producto.serializer.js`, etc.
- Cada serializer exporta una función `serializar<Entidad>(instancia)` que recibe la instancia del ORM (o un objeto plano) y devuelve el DTO.
- Para listados: map sobre `serializar<Entidad>`; para colecciones con metadata, el service arma `{ items, total }` y serializa cada ítem.

## Filtración por rol

Cuando el BRD lo requiera, el serializer del módulo filtra campos según el rol del usuario autenticado (`req.usuario.rol`):

- El service pasa el rol al serializer: `serializarCompra(compra, rol)`.
- Ejemplo (tarjeta BE de compras): los costos de compra se ven solo para ADMIN; para VENDEDOR se omiten los campos de costo según las RN del BRD.
- La lista de campos visibles por rol se define en el serializer (whitelist por rol), no en el controller ni con lógica dispersa.

## Errores

- Los errores no se serializan con DTO: responden `{ message, errors }` según `error.middleware.js` (400/401/403/500).
- Ningún error expone detalles internos (queries, stack traces, hashes).
