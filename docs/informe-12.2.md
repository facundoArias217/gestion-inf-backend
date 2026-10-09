# Informe de ejecución — Tarjeta 12.2 [BE] Dashboard

**Tarjeta:** 12.2 — Dashboard: agregación de indicadores (backend)
**Tipo:** [BE] · **Fecha:** 08/10/2026 · **Repositorio:** gestion-inf-backend

## Alcance ejecutado

- **Endpoint:** `GET /dashboard` (solo ADMIN, CE-DSH-01) con las 4 métricas del BRD:
  - `productosBajoStock`: `{ total, items }` — activos con `stock <= 5` (constante `LIMITE_STOCK_BAJO`, ajustable), top 5 ordenados por stock asc.
  - `ventasHoy` y `ventasMes`: `{ cantidad, montoTotal }` — ventas COMPLETADAS de hoy / del mes en curso; el monto se **deriva** de los detalles (cantidad × precioUnitario histórico), sin persistir totales (patrón del sistema).
  - `presupuestosPendientes`: `{ cantidad }` — estado PENDIENTE (los VENCIDO siguen computados en el FE, RFN-16).
  - `comprasRecientes`: últimas 5 compras (id, proveedorId, fecha, estado).
- **Colección Postman:** carpeta "Dashboard" con ejemplos 200/401/403.

## Reglas de negocio cubiertas

| Regla | Implementación |
| --- | --- |
| RF-DSH-01 | Las 4 métricas del CE-DSH-01; sin reglas nuevas de negocio (solo agregación). |
| RN-USR-02 | Ruta ADMIN-only (403 para VENDEDOR, verificado). |
| RFN-04 | Bajo stock consultado sobre activos con `activo = true`. |

## Decisiones tomadas

1. **Sin serializer dedicado:** el dashboard agrega; el service arma el DTO plano con whitelists explícitas por ítem (`{id, nombre, stock}`, `{id, proveedorId, fecha, estado}`) — el espíritu de la skill `serializacion-respuestas` (nunca instancias del ORM) se cumple; documentado como excepción razonada en el informe.
2. **Umbral de bajo stock = 5** como constante nombrada del service, ajustable en un solo lugar (decisión de UX, no del BRD).
3. `ventasMes` usa `fecha BETWEEN inicioMes AND hoy` para no contar ventas fechadas a futuro.

## Verificación

Batería **13/13 pruebas OK**, comparando cada métrica contra SQL directo sobre la base sembrada: bajoStock total = 11 · ventasHoy 0/0 · ventasMes 6 / $2.202.000 · presusPendientes = 4 · comprasRecientes = 5. Sin token 401 · VENDEDOR 403 · whitelists verificadas en los items. El endpoint es de solo lectura: no genera datos de prueba.

## Checklist manual pendiente

Con la 12.1/12.3: loguearse como admin y ver el dashboard con las 4 métricas y las dos listas.
