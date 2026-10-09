# Flujos de prueba manual

Guion de revisión del sistema contra los **seeds de demo mínima**, organizado sobre los Casos de Estudio del BRD (§3.2). Datos sembrados que usan los flujos: clientes **Gonzalo Ríos / María Gómez / Julieta Acuña (inactiva)** · proveedores **Maxiconsumo / MayoristaTech / PuntoByte (inactivo)** · compra PENDIENTE · armados 3 FINALIZADO + **«Configuración pendiente» BORRADOR completo** · presupuestos: **1** PENDIENTE vigente (armado + suelto), **2** ACEPTADO listo para convertir, **3** vencido, **4** CONVERTIDO · ventas: 2 COMPLETADA (una con un **pago RECHAZADO** para reintentar) + 1 CANCELADA · producto **RX 7600 Challenger con stock 0**.

Login: `admin@tienda.com / admin123` (ADMIN) y `vendedor@tienda.com / vendedor123` (VENDEDOR).

---

## Flujos principales

### F1 — Arranque y roles (CE-USR-01)

1. Login como vendedor → menú sin Dashboard/Compras/Proveedores/Usuarios; redirige a `/ventas`.
2. Menú de usuario → **Modo oscuro** → recargar (F5) → persiste.
3. Cerrar sesión → login como admin → menú completo; redirige a `/dashboard`.

### F2 — Reposición de stock (CE-COM-01)

1. Como admin: **Productos** → nuevo producto → aparece ACTIVO.
2. **Compras** → nueva compra (proveedor Maxiconsumo, 1-2 productos con su costo) → queda **PENDIENTE**.
3. Verificar en Productos que el stock **no** se movió.
4. Compras → **Confirmar** → el stock sube exactamente lo comprado.
5. Crear otra compra y **cancelarla** → stock intacto.

### F3 — Venta directa (CE-VTA-01)

1. Como vendedor: **Ventas** → nueva venta (cliente Gonzalo, 1-2 productos; precio de lista solo lectura).
2. Registrar → nace COMPLETADA con total derivado en el listado.
3. Productos: stock bajado exacto.
4. Detalle → **Cancelar** → confirmar → stock reintegrado y estado CANCELADA definitivo.

### F4 — El diferenciador completo (CE-ARM-01 + CE-PRE-01 + CE-PRE-02 + CE-PAG-01)

1. **Armá tu PC** → nuevo armado → llenar los slots por categoría → guardar BORRADOR → editar → **Finalizar** (si falta una categoría, el error lista las faltantes; completo → FINALIZADO).
2. **Presupuestos** → nuevo → cliente María Gómez + el armado FINALIZADO + un suelto → probá la vigencia (48 h default y **Personalizada**) → PENDIENTE.
3. ⋯ → **Imprimir** → hoja A4 + diálogo de impresión.
4. **Aceptar** → ⋯ → **Convertir en venta** → confirmación → toast con el n° de venta → CONVERTIDO.
5. Ventas: la derivada con las líneas del armado + el suelto · Productos: todo descontado.
6. **Pagos** → registrar el cobro de esa venta → monto precargado con el total → APROBADO.
7. Dashboard (admin): la venta de hoy/mes movió; el presupuesto ya no es pendiente.

### F5 — Dashboard operativo (CE-DSH-01)

Los 4 KPIs con accent border, bajo stock (el RX 7600 en rojo con 0) y compras recientes con razón social del proveedor.

---

## Flujos secundarios

| # | Flujo | Pasos clave y esperado |
| --- | --- | --- |
| S1 | **Baja lógica e histórico** (CE-CAT-01) | Clientes → baja a Gonzalo → tab **Histórico** → reactivar lo trae de vuelta. Proveedores: PuntoByte ya está en Histórico. Usuarios: bajar a un usuario creado → su login falla; la propia opción de baja está **deshabilitada**. |
| S2 | **Vencido → recotizar** | Presupuestos → filtro **Vencidos** → el presupuesto 3 figura VENCIDO sin aceptar/rechazar → ⋯ → **Duplicar (recotizar)** → nace PENDIENTE con vencimiento a 48 h y precios de lista actuales; el original intacto. |
| S3 | **Armado como plantilla** | Un FINALIZADO → ⋯ → **Duplicar** → editor con «… (copia)» en BORRADOR. |
| S4 | **Pago rechazado → reintento** | Pagos: el RECHAZADO de la venta 2 → registrar cobro de nuevo sobre esa venta → APROBADO → el par queda visible. El select solo ofrece ventas COMPLETADAs. |
| S5 | **Validaciones de forma** | CUIT con dígito verificador cambiado → rechazado; cantidad > stock en venta → error por fila; presupuesto sin armado ni sueltos → no registra; vendedor en Productos → solo lectura. |
| S6 | **Clave de usuario** | Editar un usuario sin tocar la clave → entra con la vieja; cambiarle la clave → entra con la nueva. |
| S7 | **Rollback de conversión** | Presupuesto nuevo solo con el **RX 7600 (stock 0)** → aceptarlo → **Convertir** → 409 con toast → el presupuesto sigue ACEPTADO, no existe venta nueva, stock intacto. |

---

## Búsqueda, orden y paginación (post Oleada B)

- En cada listado, el botón redondo con lupa se expande a «Buscar <módulo>…» y filtra la tabla en vivo (sin tildes); sin resultados → **«No se encontraron resultados para tu búsqueda»**.
- En Productos, el filtro **«Todas las categorías»** es buscable: escribir letras reduce las categorías en vivo.
- Las columnas con ▲/▼/↕ ordenan al clic y se persiste por módulo; los listados largos pagan de a 10 por página.

## Cierre de la sesión de pruebas — reset a la demo mínima (§8.1 de `levantamiento-back.md`)

```bash
docker exec gestion-inf-db psql -U postgres -d gestion_informatica -c "TRUNCATE TABLE pagos, venta_detalles, ventas, presupuesto_detalles, presupuestos, armado_componentes, armados, compra_detalles, compras, clientes, proveedores, productos, categorias, usuarios RESTART IDENTITY CASCADE; DELETE FROM \"SequelizeData\";"
npx sequelize-cli db:seed:all
```
