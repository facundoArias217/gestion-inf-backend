const {
  sequelize,
  Cliente,
  Producto,
  Venta,
  VentaDetalle,
} = require('../database/models');
const {
  serializarVenta,
  serializarVentas,
} = require('../serializers/venta.serializer');

function errorDeNegocio(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

async function listar() {
  const ventas = await Venta.findAll({
    include: [{ model: VentaDetalle, as: 'detalles' }],
    order: [['id', 'ASC']],
  });
  return serializarVentas(ventas);
}

async function crear({ clienteId, fecha, detalles }, usuarioId) {
  const cliente = await Cliente.findByPk(clienteId);
  if (!cliente) {
    throw errorDeNegocio('El cliente indicado no existe', 400);
  }

  const venta = await sequelize.transaction(async (transaccion) => {
    const precios = {};
    for (const detalle of detalles) {
      const producto = await Producto.findByPk(detalle.productoId, {
        lock: transaccion.LOCK.UPDATE,
        transaction: transaccion,
      });

      if (!producto) {
        throw errorDeNegocio(
          `El producto ${detalle.productoId} del detalle no existe`,
          400,
        );
      }

      if (detalle.cantidad > producto.stock) {
        throw errorDeNegocio(
          `Stock insuficiente de ${producto.nombre} (disponible: ${producto.stock})`,
          409,
        );
      }

      precios[detalle.productoId] = producto.precio;
    }

    const nueva = await Venta.create(
      { clienteId, usuarioId, fecha, estado: 'COMPLETADA' },
      { transaction: transaccion },
    );

    await VentaDetalle.bulkCreate(
      detalles.map((detalle) => ({
        ventaId: nueva.id,
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        precioUnitario: precios[detalle.productoId],
      })),
      { transaction: transaccion },
    );

    for (const detalle of detalles) {
      await Producto.decrement(
        { stock: detalle.cantidad },
        {
          where: { id: detalle.productoId },
          transaction: transaccion,
        },
      );
    }

    return nueva;
  });

  const ventaCompleta = await Venta.findByPk(venta.id, {
    include: [{ model: VentaDetalle, as: 'detalles' }],
  });
  return serializarVenta(ventaCompleta);
}

async function cambiarEstado(id, { estado }) {
  const resultado = await sequelize.transaction(async (transaccion) => {
    const venta = await Venta.findByPk(id, {
      lock: transaccion.LOCK.UPDATE,
      transaction: transaccion,
    });

    if (!venta) {
      throw errorDeNegocio('Venta no encontrada', 404);
    }

    if (venta.estado !== 'COMPLETADA') {
      throw errorDeNegocio(
        'Solo se puede cancelar una venta COMPLETADA',
        409,
      );
    }

    const detalles = await VentaDetalle.findAll({
      where: { ventaId: id },
      transaction: transaccion,
    });

    for (const detalle of detalles) {
      const producto = await Producto.findByPk(detalle.productoId, {
        lock: transaccion.LOCK.UPDATE,
        transaction: transaccion,
      });

      if (!producto) {
        throw errorDeNegocio(
          `El producto ${detalle.productoId} del detalle no existe`,
          400,
        );
      }

      await producto.increment(
        { stock: detalle.cantidad },
        { transaction: transaccion },
      );
    }

    await venta.update({ estado }, { transaction: transaccion });
    return venta;
  });

  const ventaFinal = await Venta.findByPk(resultado.id, {
    include: [{ model: VentaDetalle, as: 'detalles' }],
  });
  return { venta: serializarVenta(ventaFinal), estado };
}

module.exports = { listar, crear, cambiarEstado };
