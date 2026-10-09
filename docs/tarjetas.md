# Tarjetas del tablero (backlog completo)

Fuente de verdad: `docs/brd.md`. Flujo: Backlog → Haciendo (máx. 1) → Self-review → Hecho en dev → Integración. Una tarjeta = una rama feature. Historias de usuario cruzadas: `docs/HU.md` (misma numeración de módulos).

## Criterios de aceptación por tipo de tarjeta

- **[FE-mock]:** pantallas del BRD (RF correspondiente) funcionales con datos mock de `features/<modulo>/mocks.js`; `services.js` con ramas `isIntegrated('<modulo>')`; respeta AGENTS.md del frontend (features, componentes, estado); `npm run lint` y `npm run build` OK; prueba manual del flujo.
- **[BE]:** reglas de negocio implementadas según la skill `skills/reglas-de-negocio` (referenciar las RN que cubre); capas respetadas (routes → validators → controllers → services → models); la respuesta se arma con un DTO/serializer explícito por endpoint (`src/serializers/`, según la skill `skills/serializacion-respuestas`), nunca se devuelve la instancia del ORM directamente; models/migrations creados; endpoints del módulo cubiertos en la colección Postman; server arranca y el módulo se prueba contra Postman.
- **[Int]:** módulo agregado al Set de `src/config/integration.js`; ramas mock del `services.js` del módulo activadas (sin tocar módulos ya migrados); `mocks.js` conservados (demos offline); flujo probado end-to-end frontend ↔ backend real con la colección Postman (environment Local).
- **[Contrato]:** colección exportada y versionada en `docs/postman/collection.json`; carpetas por módulo; shapes según `docs/modelo-datos-analisis-v1.md`; respuestas de ejemplo de éxitos y errores (`{ message, errors }`); un solo environment "Local" (`{{baseUrl}}` + token de `/auth/login`).

---

## Módulo 0 — Transversal

| ID | Tipo | Título | Rama | Depende de |
| --- | --- | --- | --- | --- |
| 0.1 | FE-mock | Setup Tailwind CSS + shadcn/ui | fe/setup-estilos | — |
| 0.2 | Contrato | Colección Postman de contrato (todos los módulos, con ejemplos) | be/contrato-api | — |

No requieren tarjeta: estructura base de ambos repos, `src/lib/api.js`, `src/config/integration.js` y el esqueleto del panel (van dentro de la tarjeta 1.1).

## Módulo 1 — Auth

| ID | Tipo | Título | Rama | Depende de |
| --- | --- | --- | --- | --- |
| 1.1 | FE-mock | Login + shell del panel con menú y guards por rol | fe/auth | 0.1 |
| 1.2 | BE | Autenticación: login, JWT y autorización por rol | be/auth | — |
| 1.3 | Int | Auth real | int/auth | 1.1, 1.2 |

## Módulo 2 — Categorías

| ID | Tipo | Título | Rama | Depende de |
| --- | --- | --- | --- | --- |
| 2.1 | FE-mock | Categorías: listado, alta, edición y baja lógica | fe/categorias | 1.1 |
| 2.2 | BE | CRUD de categorías | be/categorias | 1.2 |
| 2.3 | Int | Categorías real | int/categorias | 2.1, 2.2 |

## Módulo 3 — Productos

| ID | Tipo | Título | Rama | Depende de |
| --- | --- | --- | --- | --- |
| 3.1 | FE-mock | Productos: listado, alta, edición y baja lógica | fe/productos | 1.1, 2.1 |
| 3.2 | BE | CRUD de productos, stock y baja lógica | be/productos | 1.2, 2.2 |
| 3.3 | Int | Productos real | int/productos | 3.1, 3.2 |

## Módulo 4 — Clientes

| ID | Tipo | Título | Rama | Depende de |
| --- | --- | --- | --- | --- |
| 4.1 | FE-mock | Clientes: listado, alta, edición y baja lógica | fe/clientes | 1.1 |
| 4.2 | BE | CRUD de clientes con baja lógica | be/clientes | 1.2 |
| 4.3 | Int | Clientes real | int/clientes | 4.1, 4.2 |

## Módulo 5 — Proveedores

| ID | Tipo | Título | Rama | Depende de |
| --- | --- | --- | --- | --- |
| 5.1 | FE-mock | Proveedores: listado, alta, edición y baja lógica | fe/proveedores | 1.1 |
| 5.2 | BE | CRUD de proveedores con baja lógica | be/proveedores | 1.2 |
| 5.3 | Int | Proveedores real | int/proveedores | 5.1, 5.2 |

## Módulo 6 — Compras

| ID | Tipo | Título | Rama | Depende de |
| --- | --- | --- | --- | --- |
| 6.1 | FE-mock | Compras: registro con detalle multi-item | fe/compras | 1.1, 3.1, 5.1 |
| 6.2 | FE-mock | Compras: confirmación, cancelación y estados | fe/compras-estados | 6.1 |
| 6.3 | BE | Compras: registro, confirmación y cancelación con stock transaccional | be/compras | 1.2, 3.2, 5.2 |
| 6.4 | Int | Compras real | int/compras | 6.2, 6.3 |

División justificada: el formulario multi-item de detalle y el ciclo de estados (PENDIENTE/COMPLETADA/CANCELADA) justifican dos tarjetas FE.

## Módulo 7 — Ventas

| ID | Tipo | Título | Rama | Depende de |
| --- | --- | --- | --- | --- |
| 7.1 | FE-mock | Ventas: registro directa con detalle y cancelación | fe/ventas | 1.1, 3.1, 4.1 |
| 7.2 | BE | Ventas: registro con descuento de stock y cancelación transaccional | be/ventas | 1.2, 3.2, 4.2 |
| 7.3 | Int | Ventas real | int/ventas | 7.1, 7.2 |

Una sola tarjeta FE: la venta nace COMPLETADA, sin ciclo de confirmación como en compras (RN-VTA-01).

## Módulo 8 — Armados

| ID | Tipo | Título | Rama | Depende de |
| --- | --- | --- | --- | --- |
| 8.1 | FE-mock | Armados: configuración de PC (selección de componentes) | fe/armados | 1.1, 3.1 |
| 8.2 | FE-mock | Armados: validación, advertencias de incompatibilidad y finalización | fe/armados-validacion | 8.1 |
| 8.3 | BE | Armados: CRUD, completitud, advertencias y disponibilidad | be/armados | 1.2, 3.2 |
| 8.4 | Int | Armados real | int/armados | 8.2, 8.3 |

División justificada: la validación de completitud + advertencias no bloqueantes (RN-ARM-02) y el flujo de estados hasta FINALIZADO son complejos por sí mismos.

## Módulo 9 — Presupuestos

| ID | Tipo | Título | Rama | Depende de |
| --- | --- | --- | --- | --- |
| 9.1 | FE-mock | Presupuestos: creación, detalle y estados con vencimiento | fe/presupuestos | 1.1, 3.1, 4.1, 8.1 |
| 9.2 | FE-mock | Presupuestos: conversión en venta | fe/presupuestos-conversion | 9.1, 7.1 |
| 9.3 | BE | Presupuestos: creación, estados y vencimiento | be/presupuestos | 1.2, 3.2, 4.2, 8.3 |
| 9.4 | BE | Presupuestos: conversión en venta con reverificación de stock | be/presupuestos-conversion | 9.3, 7.2 |
| 9.5 | Int | Presupuestos real | int/presupuestos | 9.2, 9.4 |

División justificada: la conversión es el flujo más complejo del sistema (reverificación de stock, conversión única, preservación de precios históricos: RN-PRE-03/04/05), transaccional con venta y stock, por lo que se separa tanto en FE como en BE.

## Módulo 10 — Pagos

| ID | Tipo | Título | Rama | Depende de |
| --- | --- | --- | --- | --- |
| 10.1 | FE-mock | Pagos: registro del cobro simulado | fe/pagos | 1.1, 7.1 |
| 10.2 | BE | Pagos: registro de pago simulado | be/pagos | 1.2, 7.2 |
| 10.3 | Int | Pagos real | int/pagos | 10.1, 10.2 |

## Módulo 11 — Usuarios

| ID | Tipo | Título | Rama | Depende de |
| --- | --- | --- | --- | --- |
| 11.1 | FE-mock | Usuarios: listado, alta, edición y baja lógica | fe/usuarios | 1.1 |
| 11.2 | BE | Usuarios: gestión y roles | be/usuarios | 1.2 |
| 11.3 | Int | Usuarios real | int/usuarios | 11.1, 11.2 |

## Módulo 12 — Dashboard

| ID | Tipo | Título | Rama | Depende de |
| --- | --- | --- | --- | --- |
| 12.1 | FE-mock | Dashboard: métricas operativas | fe/dashboard-metricas | 1.1 |
| 12.2 | BE | Dashboard: agregación de indicadores | be/dashboard | 3.2, 6.3, 7.2, 9.3 |
| 12.3 | Int | Dashboard real | int/dashboard | 12.1, 12.2 |

Último módulo por dependencia: el dashboard agrega datos de productos, compras, ventas y presupuestos.

## Módulo 13 — Mejoras post-MVP (Lote 1: visual + comercial)

Aprobadas con el MVP terminado (42/42). Convenciones idénticas: una tarjeta = una rama, informe en el mismo commit, Postman en el mismo commit del BE, skill si se decide una regla.

| ID | Tipo | Título | Rama | Depende de |
| --- | --- | --- | --- | --- |
| 13.1 | FE | Oleada visual: fechas locales, empty states, jerarquía, badges accesibles, dark mode, conteos | fe/mejoras-visuales | — |
| 13.2 | BE | Presupuestos: duplicar (recotización en un clic, RFN-22) | be/presupuestos-duplicar | 9.3 |
| 13.3 | BE | Armados: duplicar como plantilla (BORRADOR con precios actuales) | be/armados-duplicar | 8.3 |
| 13.4 | FE | Presupuesto imprimible (ruta A4 con @media print) | fe/presupuesto-imprimible | 9.2 |
| 13.5 | FE | Acciones de duplicado en presupuestos y armados | fe/duplicaciones-ui | 13.2, 13.3 |

## Módulo 14 — Mejoras post-MVP (Lote 2: Oleada B, búsqueda y tablas)

| ID | Tipo | Título | Rama | Depende de |
| --- | --- | --- | --- | --- |
| 14.1 | FE | Búsqueda en listados: buscador expansivo (lupa → «Buscar…») con filtrado en vivo | fe/busqueda-listados | — |
| 14.2 | FE | Combobox buscable: filtro de categorías de Productos y selects de formularios | fe/combobox-buscable | 14.1 |
| 14.3 | FE | Orden por columna clickeable (reemplaza OrdenSelect) | fe/sort-columnas | 14.1 |
| 14.4 | FE | Paginación client-side de 10 por página | fe/paginacion | 14.1 |

---

## Totales

- **Total de tarjetas: 42**
- **[FE-mock]: 16** · **[BE]: 13** · **[Int]: 12** · **[Contrato]: 1**

## Orden sugerido de ejecución

M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8 → M9 → M10 → M11 → M12.

Dentro de cada módulo: FE-mock primero (puede adelantarse respecto al BE de módulos anteriores, para mantener el prototipo-first), luego BE, e Int al cerrar el módulo (agregar al Set de `integration.js`). El [Contrato] 0.2 se ejecuta junto a M0 y se actualiza con cada tarjeta BE.
