const CAMPOS_PUBLICOS = ['id', 'proveedorId', 'fecha', 'estado', 'createdAt', 'updatedAt'];

function serializarDetalle(detalle) {
  const plano = detalle.toJSON ? detalle.toJSON() : detalle;
  return {
    id: plano.id,
    productoId: plano.productoId,
    cantidad: plano.cantidad,
    precioUnitario: Number(plano.precioUnitario),
  };
}

function serializarCompra(compra) {
  const plano = compra.toJSON ? compra.toJSON() : compra;
  const dto = CAMPOS_PUBLICOS.reduce((resultado, campo) => {
    resultado[campo] = plano[campo];
    return resultado;
  }, {});
  dto.detalles = (plano.detalles ?? []).map(serializarDetalle);
  return dto;
}

function serializarCompras(compras) {
  return compras.map(serializarCompra);
}

module.exports = { serializarCompra, serializarCompras, CAMPOS_PUBLICOS };
