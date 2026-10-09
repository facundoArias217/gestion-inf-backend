# gestion-inf-backend

Backend del **sistema de gestión para una tienda de productos informáticos**: catálogo, compras, ventas, presupuestos con vencimiento, armado de PCs y pagos simulados. Panel interno con roles **Administrador/Vendedor** (sin e-commerce). Proyecto académico universitario.

## Stack

- **Node.js 24 + Express 5** (CommonJS)
- **Sequelize 6 + PostgreSQL 16** (transacciones y locks `FOR UPDATE`)
- **Joi** para validación de capas
- **JWT** (jsonwebtoken) + **bcrypt**

## Requisitos

- **Node 24** — el repo tiene `.nvmrc`; con nvm-windows v2 (modo shim) `node`/`npm` resuelven la versión del proyecto automáticamente. No uses `nvm use` global: pisa a otros proyectos.
- **Docker Desktop** — la base corre en un contenedor aislado.

## Levantamiento

```bash
docker compose up -d              # Postgres 16 en el puerto 5433 (contenedor gestion-inf-db)
cp .env.example .env               # editar PORT/JWT_SECRET (nunca el placeholder "changeme")
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev                        # API en http://localhost:3001
```

Usuarios de prueba (seeds):

| Email | Clave | Rol |
| --- | --- | --- |
| `admin@tienda.com` | `admin123` | ADMIN |
| `vendedor@tienda.com` | `vendedor123` | VENDEDOR |

## Endpoints

Todos responden `{ message, data }` en éxito y `{ message, errors }` en error. Auth por `Authorization: Bearer <token>`.

| Módulo | Endpoints | Roles |
| --- | --- | --- |
| Auth | `POST /auth/login` · `GET /auth/me` | público / autenticado |
| Categorías | `GET POST /categorias` · `PUT /categorias/:id` · `PATCH /categorias/:id/estado` | GET ambos; mutaciones ADMIN |
| Productos | `GET POST /productos` · `PUT /productos/:id` · `PATCH /productos/:id/estado` | GET ambos; mutaciones ADMIN |
| Clientes | `GET POST /clientes` · `PUT /clientes/:id` · `PATCH /clientes/:id/estado` | ADMIN y VENDEDOR |
| Proveedores | `GET POST /proveedores` · `PUT /proveedores/:id` · `PATCH /proveedores/:id/estado` | ADMIN |
| Compras | `GET POST /compras` · `PATCH /compras/:id/estado` (COMPLETADA incrementa stock) | ADMIN |
| Ventas | `GET POST /ventas` (nace COMPLETADA, descuenta stock) · `PATCH /ventas/:id/estado` (CANCELADA reintegra) | ADMIN y VENDEDOR |
| Armados | `GET POST /armados` · `PUT /armados/:id` · `PATCH /armados/:id/estado` (FINALIZADO exige completitud) · `POST /armados/:id/duplicar` | ADMIN y VENDEDOR |
| Presupuestos | `GET POST /presupuestos` · `PATCH /presupuestos/:id/estado` · `POST /presupuestos/:id/convertir` · `POST /presupuestos/:id/duplicar` | ADMIN y VENDEDOR |
| Pagos | `GET /pagos?ventaId=` · `POST /pagos` (solo ventas COMPLETADA; no toca stock) | ADMIN y VENDEDOR |
| Usuarios | `GET POST /usuarios` · `PUT /usuarios/:id` · `PATCH /usuarios/:id/estado` | ADMIN |
| Dashboard | `GET /dashboard` (bajo stock, ventas hoy/mes, presupuestos pendientes, compras recientes) | ADMIN |

El contrato completo con ejemplos de éxito y error está en la colección Postman: `docs/postman/collection.json` + `environment.json` (environment "Local"; el test del request Login guarda el token en `{{token}}`).

## Estructura

```
src/
├── config/          variables de entorno
├── controllers/     HTTP: reciben, delegan al service, responden
├── database/        config, migrations, seeders y models (Sequelize)
├── middlewares/     JWT + roles y manejo centralizado de errores
├── routes/          un router por módulo + validators Joi
├── serializers/     DTOs explícitos (nunca instancias del ORM)
├── services/        lógica de negocio y transacciones
└── validators/      esquemas Joi por módulo
```

## Documentación

- `docs/brd.md` — fuente de verdad del alcance y las reglas de negocio.
- `docs/tarjetas.md` — tablero del proyecto (una tarjeta = una rama = un informe).
- `skills/reglas-de-negocio/SKILL.md` — reglas del BRD + decisiones de implementación (RFN-01..22).
- `docs/informe-<tarjeta>.md` — informe de ejecución por tarjeta con su batería de pruebas.
- `docs/levantamiento-back.md` — guía de entorno, seeds, resets y problemas comunes.
