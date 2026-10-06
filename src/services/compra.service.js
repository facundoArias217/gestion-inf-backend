const {
  sequelize,
  Compra,
  CompraDetalle,
  Producto,
  Proveedor,
} = require('../database/models');
const {
  serializarCompra,
  serializarCompras,
} = require('../serializers/compra.serializer');

function errorDeNegocio(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

async function listar() {
  const compras = await Compra.findAll({
    include: [{ model: CompraDetalle, as: 'detalles' }],
    order: [['id', 'ASC']],
  });
  return serializarCompras(compras);
}

async function crear({ proveedorId, fecha, detalles }, usuarioId) {
  const proveedor = await Proveedor.findByPk(proveedorId);
  if (!proveedor) {
    throw errorDeNegocio('El proveedor indicado no existe', 400);
  }

  for (const detalle of detalles) {
    const producto = await Producto.findByPk(detalle.productoId);
    if (!producto) {
      throw errorDeNegocio(
        `El producto ${detalle.productoId} del detalle no existe`,
        400,
      );
    }
  }

  const compra = await sequelize.transaction(async (transaccion) => {
    const nueva = await Compra.create(
      { proveedorId, usuarioId, fecha, estado: 'PENDIENTE' },
      { transaction: transaccion },
    );

    await CompraDetalle.bulkCreate(
      detalles.map((detalle) => ({
        compraId: nueva.id,
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
      })),
      { transaction: transaccion },
    );

    return nueva;
  });

  const compraCompleta = await Compra.findByPk(compra.id, {
    include: [{ model: CompraDetalle, as: 'detalles' }],
  });
  return serializarCompra(compraCompleta);
}

async function cambiarEstado(id, { estado }) {
  const resultado = await sequelize.transaction(async (transaccion) => {
    const compra = await Compra.findByPk(id, {
      lock: transaccion.LOCK.UPDATE,
      transaction: transaccion,
    });

    if (!compra) {
      throw errorDeNegocio('Compra no encontrada', 404);
    }

    if (compra.estado !== 'PENDIENTE') {
      throw errorDeNegocio(
        'Solo se puede confirmar o cancelar una compra PENDIENTE',
        409,
      );
    }

    const detalles = await CompraDetalle.findAll({
      where: { compraId: id },
      transaction: transaccion,
    });

    if (estado === 'COMPLETADA') {
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
    }

    await compra.update({ estado }, { transaction: transaccion });
    return compra;
  });

  const compraFinal = await Compra.findByPk(resultado.id, {
    include: [{ model: CompraDetalle, as: 'detalles' }],
  });
  return { compra: serializarCompra(compraFinal), estado };
}

module.exports = { listar, crear, cambiarEstado };
