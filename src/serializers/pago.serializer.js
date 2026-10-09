const CAMPOS_PUBLICOS = ['id', 'ventaId', 'medioPago', 'resultado', 'fecha', 'createdAt', 'updatedAt'];

function serializarPago(pago) {
  const plano = pago.toJSON ? pago.toJSON() : pago;
  const dto = CAMPOS_PUBLICOS.reduce((resultado, campo) => {
    resultado[campo] = plano[campo];
    return resultado;
  }, {});
  dto.monto = Number(plano.monto);
  return dto;
}

function serializarPagos(pagos) {
  return pagos.map(serializarPago);
}

module.exports = { serializarPago, serializarPagos, CAMPOS_PUBLICOS };
