const CAMPOS_PUBLICOS = ['id', 'clienteId', 'armadoId', 'fecha', 'fechaVencimiento', 'estado', 'createdAt', 'updatedAt'];

function serializarDetalle(detalle) {
  const plano = detalle.toJSON ? detalle.toJSON() : detalle;
  return {
    id: plano.id,
    productoId: plano.productoId,
    cantidad: plano.cantidad,
    precioUnitario: Number(plano.precioUnitario),
  };
}

function serializarPresupuesto(presupuesto) {
  const plano = presupuesto.toJSON ? presupuesto.toJSON() : presupuesto;
  const dto = CAMPOS_PUBLICOS.reduce((resultado, campo) => {
    resultado[campo] = plano[campo];
    return resultado;
  }, {});
  dto.detalles = (plano.detalles ?? []).map(serializarDetalle);
  return dto;
}

function serializarPresupuestos(presupuestos) {
  return presupuestos.map(serializarPresupuesto);
}

module.exports = { serializarPresupuesto, serializarPresupuestos, CAMPOS_PUBLICOS };
