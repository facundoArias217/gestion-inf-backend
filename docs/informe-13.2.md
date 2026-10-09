# Informe de ejecución — Tarjeta 13.2 [BE] Duplicar presupuesto

**Tarjeta:** 13.2 — Presupuestos: duplicar (recotización en un clic, RFN-22)
**Tipo:** [BE] · **Fecha:** 09/10/2026 · **Repositorio:** gestion-inf-backend · **Rama:** `be/presupuestos-duplicar`

## Alcance ejecutado

- **Endpoint:** `POST /presupuestos/:id/duplicar` (ADMIN/VENDEDOR) → 201 con el presupuesto duplicado.
- **`presupuesto.service.duplicar`** reutiliza `crear` al máximo: carga el original con sus detalles, valida que tenga algo que duplicar (armado o sueltos) y delega en `crear` con fecha de hoy, **vencimiento hoy + 48 h** (default de RFN-13) y las mismas cantidades — con lo que los precios quedan **re-cotizados a lista actual** y todas las validaciones de la 9.3 (cliente, armado FINALIZADO, RFN-15) se aplican gratis.
- **Skill:** RFN-22 documenta la semántica (cualquier estado del original, que es de solo lectura; el duplicado nace PENDIENTE).
- **Colección Postman:** request "Duplicar" en la carpeta Presupuestos (201, 400 y 404 con ejemplos).

## Reglas de negocio cubiertas

| Regla | Implementación |
| --- | --- |
| RN-PRE-03 | Duplicar ES la recotización materializada: el nuevo presupuesto cotiza a precios de lista actuales, sin tocar el original. |
| RN-PRE-05 | El original conserva intactos sus precios históricos (verificado: 42000 vs 99999 del duplicado). |
| RFN-13 | El duplicado vence hoy + 48 h (default de vigencia); la fecha la computa el backend. |
| RFN-09 | El original no cambia de estado por el hecho de duplicarse; el duplicado nace PENDIENTE en la máquina de estados. |

## Verificación

Batería **12/12 pruebas OK** contra la API real (duplicados eliminados y precio restaurado tras la corrida):

- Precio de lista del producto 17 elevado a 99999 antes de duplicar → el duplicado cotiza 99999 y **el original conserva 42000** (recotización + RN-PRE-05 en una sola prueba).
- Duplicado nace PENDIENTE, fecha de hoy, vence hoy+2, mantiene cliente y armado.
- Se puede duplicar un PENDIENTE, un CONVERTIDO y un vencido ACEPTADO (cualquier estado) → 201 en todos; duplicar dos veces el mismo original → dos 201.
- Inexistente → 404 · cleanup con la base restaurada (8 presupuestos).

## Checklist manual pendiente

Con la 13.5 integrada: duplicar desde el navegador un presupuesto vencido y verificar que el nuevo cotiza a precios actuales con vencimiento a 48 h.
