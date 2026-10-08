# Informe de ejecución — Tarjeta 8.3 [BE] Armados

**Tarjeta:** 8.3 — Armados: CRUD, completitud, advertencias y disponibilidad (backend)
**Tipo:** [BE] · **Fecha:** 08/10/2026 · **Repositorio:** gestion-inf-backend

## Alcance ejecutado

Implementación del backend del módulo de armados de PC (diferenciador del proyecto), cubriendo el contrato definido por el frontend en las tarjetas 8.1/8.2:

- **Migración** `create-armados` con dos tablas: `armados` (encabezado con `usuarioId` y `clienteId` nullable) y `armado_componentes` (detalle con `precioUnitario` histórico).
- **Modelos + asociaciones**: `Armado` y `ArmadoComponente` registrados en `models/index.js` con sus `belongsTo`/`hasMany`.
- **Endpoints**: `GET /armados` (componentes embebidos) · `POST /armados` (nace BORRADOR) · `PUT /armados/:id` (solo BORRADORES) · `PATCH /armados/:id/estado { estado: FINALIZADO }`.
- **Roles**: ADMIN y VENDEDOR en todo el módulo (RN-USR-02/03).
- **Seeder** con los 6 armados del mock del frontend (3 FINALIZADO + 3 BORRADOR, con componentes) y `setval` en ambas secuencias.
- **Colección Postman**: carpeta "Armados" con ejemplos de éxitos y errores.

## Reglas de negocio cubiertas

| Regla | Implementación |
| --- | --- |
| RN-ARM-01 | El armado es autónomo: existe sin cliente ni presupuesto; `clienteId` es nullable. |
| RN-ARM-04 | Solo un armado FINALIZADO es "cerrado": el PUT lo rechaza con 409 `Solo se puede editar un armado en BORRADOR`. |
| RN-STK-01 | Al crear/editar un armado se verifica stock suficiente de cada componente dentro de la transacción con lock → 409 `Stock insuficiente de X (disponible: Y)`. |
| Regla 17 (alcance §6) | La finalización exige **completitud**: al menos un componente de cada categoría obligatoria (Procesador, Motherboard, Memoria RAM, Almacenamiento, Fuente, Gabinete) → 409 `El armado no está completo: faltan X, Y`. |
| RN-ARM-02 | Las advertencias de incompatibilidad **no viven en el backend**: son lógica de presentación del frontend (motor de keywords sobre nombre/descripción). El backend solo bloquea completitud y estado. |
| RN-ARM-03 | La disponibilidad al finalizar es informativa (la advierte el FE); el backend no bloquea la finalización por stock. La verificación obligatoria ocurrirá al confirmar la venta (M9). |

## Decisiones tomadas

1. **`precioUnitario` computado por el backend**: el frontend envía `componentes: [{ productoId, cantidad }]` sin precio; el backend toma el precio de lista actual del producto al momento de guardar y lo persiste como histórico en el detalle.
2. **`presupuestoId` diferido al M9**: la columna (y su FK unique) se agregará con la tarjeta 9.3 cuando exista la tabla `presupuestos`, por la misma razón que en `ventas`.
3. **PUT con reemplazo transaccional de componentes**: se eliminan los componentes viejos y se insertan los nuevos dentro de la misma transacción que actualiza el encabezado, con lock de la fila del armado.
4. **Completitud resuelta por nombre de categoría**: las 6 categorías obligatorias se resuelven contra la tabla `categorias` (Procesador, Motherboard, Memoria RAM, Almacenamiento, Fuente, Gabinete), sin hardcodear ids.

## Verificación

Batería de **26/26 pruebas OK** contra la API real (`be/armados`, DB con seeds):

- GET sin token 401 · GET con ambos roles 200 · 6 armados sembrados con componentes embebidos · `usuarioId` fuera del DTO · `clienteId` nullable presente.
- POST nace BORRADOR con precio computado (i5-13400F = 285000) · POST con token VENDEDOR 201 · stock insuficiente (RX 7600, stock 0) → 409 con mensaje · cliente/producto inexistente y sin componentes → 400.
- PUT reemplaza componentes (6 → 7 tras agregar GPU) y actualiza encabezado · PUT sobre FINALIZADO → 409 · PUT inexistente → 404.
- **Finalizar incompleto** (armado con solo CPU y gabinete) → 409 con faltantes exactas: `Motherboard, Memoria RAM, Almacenamiento, Fuente` · **Finalizar completo** → 200 `Armado finalizado` · reintentar sobre FINALIZADO → 409 · estado inválido → 400 · id inválido → 400 · inexistente → 404.

Los datos de prueba se eliminaron tras la corrida; la base quedó con los 6 armados sembrados.

## Problemas encontrados y soluciones

- **`FOR UPDATE` sobre join nulo** (ya conocido de la 6.3/7.2): los locks se aplican con `findByPk` sin `include`; los componentes se cargan en queries separadas dentro de la transacción.
- **TOCTOU en el PUT**: el chequeo de estado del armado se movió dentro de la transacción con lock, para evitar editar un armado que cambia de estado entre el chequeo y la escritura.

## Checklist manual pendiente

Probar contra la colección Postman (environment Local): login → Listar → Crear un armado → editarlo → finalizar uno completo y verificar que el PUT queda bloqueado.
