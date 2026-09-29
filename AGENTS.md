# AGENTS.md — gestion-inf-backend

## Contexto

Sistema de gestión interna para una tienda de productos informáticos (catálogo, compras, ventas, presupuestos y armados de PC). Dos diferenciadores: **Presupuestos** y **Armado de PCs**. Solo usuarios internos con roles **Administrador/Vendedor**; no hay e-commerce ni autogestión del cliente. Fuente de verdad de alcance y reglas: `docs/brd.md` (si otro doc contradice, gana el BRD).

## Stack

- **Node.js + Express 5** (CommonJS), **Sequelize 6 + PostgreSQL** (transaccional), **Joi** para validación.
- Dev: `npm run dev` (nodemon sobre `src/index.js`). Base de datos dev: `docker compose up -d` (Postgres 16 aislado en puerto 5433, contenedor `gestion-inf-db`); migraciones y seeds con `npx sequelize-cli db:migrate` / `db:seed:all`. El server corre en el **puerto 3001** (el 3000 lo ocupa otro proyecto).

## Estructura

```
src/
├── config/          (env.js)
├── controllers/     (uno por módulo: auth, usuario, producto, categoria, cliente, proveedor, compra, venta, presupuesto, armado, pago, dashboard)
├── database/
│   ├── config/      (config.json de sequelize-cli)
│   ├── migrations/  seeders/
│   ├── models/      (14 entidades: ..., compraDetalle, presupuestoDetalle, ventaDetalle, armadoComponente, pago; index.js con asociaciones)
│   └── sequelize.js (instancia Sequelize)
├── middlewares/     (auth.middleware.js: JWT + roles; error.middleware.js: manejo centralizado de errores)
├── routes/          (index.js router principal + un router por módulo)
├── services/        (lógica de negocio)
├── validators/      (esquemas Joi por módulo)
├── app.js           (app Express: middlewares + rutas)
└── index.js         (bootstrap del servidor HTTP)
```

## Convenciones de código

- Sin comentarios innecesarios; nombres en español para dominio (producto, presupuesto), en inglés para lo técnico (service, controller, middleware).
- Variables de entorno vía `src/config/env.js`; nunca hardcodear credenciales ni secretos. `.env` está en `.gitignore` (usar `.env.example` como referencia).
- Responder con JSON consistente: `{ message, data }` en éxito, `{ message, errors }` en error.

## Reglas para trabajar acá

- **Respetar las capas:** Routes → (validators) → Controllers → Services → Models. Los controllers no contienen lógica de negocio; los Services concentran reglas y transacciones; los Models solo encapsulan acceso a datos (Sequelize).
- **No crear carpetas/capas nuevas sin justificación** (regla documentada en `docs/decisiones-arquitectura-v1.md` §6).
- **Reglas de negocio no negociables** (`docs/brd.md`): stock consistente y transaccional; compra PENDIENTE no modifica stock, solo pasa a COMPLETADA; venta se crea COMPLETADA y descuenta stock; presupuestos con vencimiento y conversión única; armado solo FINALIZADO se asocia a presupuesto, con advertencia (no bloqueo) de incompatibilidades; pago simulado obligatorio que no toca stock; bajas lógicas (no físicas) para registros con historial.
- Ramas feature (`be/<modulo>`) con merge directo a `dev`, y luego `dev` a `main` (sin PRs). Base actual del prototipo: `prototipo-front`.
