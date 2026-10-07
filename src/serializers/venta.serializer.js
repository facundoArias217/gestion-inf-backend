const CAMPOS_PUBLICOS = ['id', 'clienteId', 'fecha', 'estado', 'createdAt', 'updatedAt'];

function serializarDetalle(detalle) {
  const plano = detalle.toJSON ? detalle.toJSON() : detalle;
  return {
    id: plano.id,
    productoId: plano.productoId,
    cantidad: plano.cantidad,
    precioUnitario: Number(plano.precioUnitario),
  };
}

function serializarVenta(venta) {
  const plano = venta.toJSON ? venta.toJSON() : venta;
  const dto = CAMPOS_PUBLICOS.reduce((resultado, campo) => {
    resultado[campo] = plano[campo];
    return resultado;
  }, {});
  dto.detalles = (plano.detalles ?? []).map(serializarDetalle);
  return dto;
}

function serializarVentas(ventas) {
  return ventas.map(serializarVenta);
}

module.exports = { serializarVenta, serializarVentas, CAMPOS_PUBLICOS };
