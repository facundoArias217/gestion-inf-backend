# Levantamiento del entorno de desarrollo

Guía para levantar el backend, la base de datos y el frontend del sistema de gestión, y para resetear la base cuando corresponda. Fuente de verdad de configuración: `.env.example` (backend) y `docker-compose.yml`.

---

## 1. Requisitos

- **Node.js 24** (Vite 8 y las dependencias actuales lo requieren): `nvm use 24.11.0`. Verificar con `node -v`.
- **Docker Desktop** corriendo (la base de datos corre en un contenedor aislado).
- Postgres local **no** es necesario: el proyecto usa su propia instancia Docker en el puerto **5433**, aislada de otros proyectos que usen 5432.

---

## 2. Levantar la base de datos

Desde la raíz del backend (`gestion-inf-backend/`):

```bash
docker compose up -d
```

- Contenedor: `gestion-inf-db` (imagen `postgres:16-alpine`).
- Puerto expuesto: **5433** (mapeado al 5432 interno del contenedor).
- Credenciales: usuario `postgres` / contraseña `postgres`.
- Al crear la base por primera vez, `POSTGRES_DB` genera `gestion_informatica` vacía.
- Persistencia: volumen con nombre `gestion_inf_pgdata` (los datos sobreviven a reinicios del contenedor y de la máquina, **no** a `docker compose down -v` ni a prunes de volúmenes — ver §8).

Verificar que esté lista:

```bash
docker ps --filter "name=gestion-inf-db"
docker exec gestion-inf-db psql -U postgres -d gestion_informatica -c "\dt"
```

---

## 3. Configurar variables de entorno

Crear `.env` en la raíz del backend a partir de `.env.example` (el `.env` no se commitea; `JWT_SECRET` debe ser un valor aleatorio real, nunca el placeholder `changeme`):

```bash
PORT=3001
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/gestion_informatica
JWT_SECRET=<secreto aleatorio>
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5174
```

- `PORT`: el server corre en **3001** (el 3000 lo ocupa otro proyecto).
- `CORS_ORIGIN`: origen del frontend en dev, necesario porque front (5174) y back (3001) son cross-origin.
- Sequelize CLI lee `src/database/config/config.json` (development: puerto 5433); el server lee `.env` vía `src/config/env.js`. Ambos apuntan al mismo contenedor.

---

## 4. Migraciones y seeds

Desde la raíz del backend:

```bash
npx sequelize-cli db:migrate        # aplica migraciones pendientes
npx sequelize-cli db:seed:all       # corre seeds pendientes (usuarios iniciales)
```

Comandos complementarios:

```bash
npx sequelize-cli db:migrate:undo                     # deshace la última migración
npx sequelize-cli db:migrate:undo:all                 # deshace todas
npx sequelize-cli db:seed:undo:all                    # deshace seeds
npx sequelize-cli migration:generate --name <nombre>  # crea una migration nueva
npx sequelize-cli seed:generate --name <nombre>       # crea un seed nuevo
```

Seeds incluidos (`src/database/seeders/usuarios-iniciales.js`): usuarios de prueba con hash bcrypt generado al correr el seed.

| Usuario | Contraseña | Rol |
| --- | --- | --- |
| `admin@tienda.com` | `admin123` | ADMIN |
| `vendedor@tienda.com` | `vendedor123` | VENDEDOR |

---

## 5. Levantar el backend

```bash
npm run dev
```

- Nodemon sobre `src/index.js`, escucha en el **puerto 3001**.
- Endpoints de auth: `POST /auth/login` y `GET /auth/me` (protegido con `Authorization: Bearer <JWT>`).

---

## 6. Levantar el frontend

Desde la raíz del frontend (`gestion-inf-frontend/`):

```bash
npm run dev
```

- Vite en el **puerto 5174** (`http://localhost:5174`).
- El cliente HTTP (`src/lib/api.js`) apunta al backend real en `http://localhost:3001`; se puede sobrescribir con `VITE_API_URL` en un `.env` del frontend.
- Solo el módulo **auth** va contra la API real (integrado en la tarjeta 1.3); el resto usa mocks hasta su tarjeta de Integración.

---

## 7. Colección Postman

Importar desde el backend:

- `docs/postman/collection.json` (colección de contrato)
- `docs/postman/environment.json` (environment **Local**: `baseUrl` = `http://localhost:3001` + `token`)

El test de la request **Login** guarda el token en el environment automáticamente; las requests protegidas lo usan con `Bearer {{token}}`.

---

## 8. Resetear la base de datos

### 8.1 Reset de datos (sin recrear el contenedor)

Trunca las tablas y vuelve a sembrar:

```bash
docker exec gestion-inf-db psql -U postgres -d gestion_informatica -c "TRUNCATE usuarios RESTART IDENTITY CASCADE;"
npx sequelize-cli db:seed:all
```

Si el histórico de `SequelizeMeta` también se quiere limpiar (re-correr migraciones desde cero sobre el mismo contenedor):

```bash
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 8.2 Reset completo (recrea contenedor y volumen)

```bash
docker compose down -v     # BAJA el contenedor y BORRA el volumen con los datos
docker compose up -d       # contenedor nuevo, volumen vacío, base gestion_informatica vacía
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

**Advertencia:** `docker compose down -v`, `docker volume rm` y cualquier prune de volúmenes **borran los datos** (tablas, seeds y el estado de `SequelizeMeta`). Después de cualquiera de esos comandos la base queda vacía y **siempre** hay que re-correr `db:migrate` + `db:seed:all`; si no, el login falla con `relation "usuarios" does not exist`.

---

## 9. Al modificar una tabla o entidad

Las migraciones son aditivas: nunca se modifica una migration ya aplicada, se crea una nueva.

1. Actualizar el modelo en `src/database/models/` y la entidad en `docs/modelo-datos-analisis-v1.md`.
2. Crear la migration:

   ```bash
   npx sequelize-cli migration:generate --name <descripcion-del-cambio>
   ```

3. Implementar `up` (cambio) y `down` (reversión) en la migration.
4. Aplicar y verificar:

   ```bash
   npx sequelize-cli db:migrate
   npm run dev
   ```

5. Si el módulo tiene seed, ajustar el seed para respetar el nuevo shape y correr `npx sequelize-cli db:seed:undo:all` + `db:seed:all` si hiciera falta.
6. Verificar el flujo del módulo contra la colección Postman antes de cerrar la tarjeta.

---

## 10. Problemas comunes

| Error | Causa | Solución |
| --- | --- | --- |
| `relation "usuarios" does not exist` (42P01) | Base vacía: el volumen se recreó (`down -v`, prune, reset de Docker) y no se re-migró | `npx sequelize-cli db:migrate` + `db:seed:all` (ver §8) |
| `password authentication failed for user "postgres"` | Apuntando a un Postgres equivocado (otro proyecto en 5432) o credenciales incorrectas | Verificar que `.env` y `config.json` apunten al puerto **5433** y que el contenedor esté corriendo |
| `EADDRINUSE: 3001` | Otro proceso ocupando el puerto | Verificar con `netstat -ano \| Select-String ":3001 "`; cerrar el proceso o cambiar `PORT` |
| Request bloqueada por CORS desde el front | `CORS_ORIGIN` no coincide con el origen del front (5174) | Revisar `CORS_ORIGIN` en `.env` y reiniciar el server |
| La app del front responde con datos viejos o sesión rota | Token expirado (8h) o `localStorage` con sesión inválida | Cerrar sesión desde el panel; el restore con `/me` limpia la sesión si el token no es válido |
