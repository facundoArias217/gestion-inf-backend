# Informe de organización del proyecto

**Fecha:** 27/09/2026
**Autor:** Arias, Facundo Roberto
**Alcance:** organización de documentación, estructura y convenciones de ambos repositorios (backend y frontend). No incluye código de negocio.

---

## 1. Documentación (backend, `docs/`)

- **`brd.md`:** reformateado a Markdown idiomático (encabezados jerárquicos, tablas, listas, negrita en términos clave), sin cambiar contenido ni redacción. Numeración "Fuera de alcance" completada como 2.6.2 para consistencia de la jerarquía del template.
- **Correcciones a favor del BRD (fuente de verdad):** se incorporó la **RN-ARM-02** (advertencia de incompatibilidades entre componentes, no bloqueante) en `alcance-informatica-v3.md` (regla 18, sección 6, con renumeración de reglas siguientes y referencias cruzadas ajustadas) y en `modelo-datos-analisis-v1.md` (validaciones de Armado). Cada archivo lleva una nota explicando el ajuste.
- **`alcance-informatica-v2.md`** y el alcance de la raíz quedaron como histórico sin tocar (contienen contradicciones más graves: pago simulado fuera del MVP y armado acoplado a `PresupuestoDetalle`).

## 2. Estructura de carpetas

- **Backend** (según `decisiones-arquitectura-v1.md` §6): capas `config/`, `database/{config,migrations,seeders,models}`, `middlewares/`, `validators/`, `controllers/`, `services/`, `routes/`, con `app.js` + `index.js` (bootstrap reconciliado con el script `npm start`). 14 models, 12 módulos en controllers/services/routes, 10 validators. `.gitignore` actualizado (`.env`, `dist`).
- **Frontend** (por features según roles y flujos del BRD): `src/app/`, `src/config/`, `src/components/`, `src/context/`, `src/hooks/`, `src/layouts/`, `src/lib/` y 12 features (`auth`, `dashboard`, `productos`, `categorias`, `clientes`, `proveedores`, `compras`, `ventas`, `presupuestos`, `armados`, `pagos`, `usuarios`), cada una con `pages/`, `components/` y `services.js`.
- Stack de estilos del frontend definido: **Tailwind CSS + shadcn/ui** (asentado en el AGENTS.md del frontend; pendiente de instalar).

## 3. Convenciones y skills

- **AGENTS.md** en la raíz de cada repo, con solo la información de su repositorio: contexto, stack, estructura, convenciones y reglas (backend: capas y reglas de negocio; frontend: features, estado y manejo de componentes).
- **Skill `skills/reglas-de-negocio/SKILL.md`** (backend): las 31 reglas del BRD con qué valida, cuándo aplica y entidad/módulo involucrado.

## 4. Convención de migración mock → API (por módulo)

Documentada en el AGENTS.md del frontend (`src/config/integration.js` ya creado). Decisiones:

- **Set inicial vacío:** ningún módulo va contra la API real hasta que el backend la exponga.
- **Validación anti-typo:** `isIntegrated` valida el nombre contra la lista de módulos válidos y lanza error si es desconocido (evita que un typo deje un módulo en mock silenciosamente).
- **Mocks conservados:** al integrar un módulo se agrega al Set y los `mocks.js` **no se eliminan** — sirven para demos offline. Los criterios de las tarjetas de Integración del tablero reflejan esto ("módulo agregado al Set + mocks conservados", no "mocks eliminados").
- **Granularidad por módulo:** permite tener, por ejemplo, Productos contra la API real mientras Ventas sigue en mock, sin tocar el código de los módulos ya migrados. Se evaluaron y descartaron: 12 variables de entorno en `.env` (no versionadas, invisibles en git) y un flag local por `services.js` (swap disperso).

## 5. Colección Postman (especificación, pendiente de crear)

- Contrato de API versionado en el backend (`docs/postman/collection.json`), con carpetas por módulo y shapes basados en `modelo-datos-analisis-v1.md`.
- **Un solo environment "Local"** (`{{baseUrl}}` = `http://localhost:3000`) con pre-request que toma el token real de `/auth/login`. Sin Mock Server de Postman: el prototipo del frontend consume mocks locales (`services.js`), y la colección se usa para testear el backend real en la integración.
