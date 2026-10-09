const { Pago, Venta } = require('../database/models');
const {
  serializarPago,
  serializarPagos,
} = require('../serializers/pago.serializer');

function errorDeNegocio(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

async function listar({ ventaId } = {}) {
  const condicion = ventaId ? { ventaId } : {};
  const pagos = await Pago.findAll({
    where: condicion,
    order: [['id', 'ASC']],
  });
  return serializarPagos(pagos);
}

async function crear({ ventaId, medioPago, monto, resultado, fecha }) {
  const venta = await Venta.findByPk(ventaId);
  if (!venta) {
    throw errorDeNegocio('La venta indicada no existe', 400);
  }

  if (venta.estado !== 'COMPLETADA') {
    throw errorDeNegocio(
      'Solo se puede cobrar una venta COMPLETADA',
      409,
    );
  }

  const pago = await Pago.create({ ventaId, medioPago, monto, resultado, fecha });
  return serializarPago(pago);
}

module.exports = { listar, crear };
