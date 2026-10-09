const {
  Armado,
  ArmadoComponente,
  Cliente,
  Presupuesto,
  PresupuestoDetalle,
  Producto,
  Venta,
  VentaDetalle,
  sequelize,
} = require('../database/models');
const {
  serializarPresupuesto,
  serializarPresupuestos,
} = require('../serializers/presupuesto.serializer');
const {
  serializarVenta,
} = require('../serializers/venta.serializer');

function errorDeNegocio(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

async function validarEncabezado({ clienteId, fecha, fechaVencimiento, armadoId, detalles }) {
  if (fechaVencimiento < fecha) {
    throw errorDeNegocio(
      'La fecha de vencimiento no puede ser anterior a la fecha del presupuesto',
      400,
    );
  }

  const cliente = await Cliente.findByPk(clienteId);
  if (!cliente) {
    throw errorDeNegocio('El cliente indicado no existe', 400);
  }

  if (armadoId != null) {
    const armado = await Armado.findByPk(armadoId);
    if (!armado) {
      throw errorDeNegocio('El armado indicado no existe', 400);
    }
    if (armado.estado !== 'FINALIZADO') {
      throw errorDeNegocio(
        'Solo un armado FINALIZADO puede asociarse a un presupuesto',
        409,
      );
    }
  }

  if (detalles.length === 0 && armadoId == null) {
    throw errorDeNegocio(
      'El presupuesto debe tener al menos un producto o un armado',
      400,
    );
  }
}

async function listar() {
  const presupuestos = await Presupuesto.findAll({
    include: [{ model: PresupuestoDetalle, as: 'detalles' }],
    order: [['id', 'ASC']],
  });
  return serializarPresupuestos(presupuestos);
}

async function crear(
  { clienteId, fecha, fechaVencimiento, armadoId, detalles },
  usuarioId,
) {
  await validarEncabezado({ clienteId, fecha, fechaVencimiento, armadoId, detalles });

  const presupuesto = await sequelize.transaction(async (transaccion) => {
    const precios = {};
    for (const detalle of detalles) {
      const producto = await Producto.findByPk(detalle.productoId, {
        transaction: transaccion,
      });

      if (!producto) {
        throw errorDeNegocio(
          `El producto ${detalle.productoId} del detalle no existe`,
          400,
        );
      }

      precios[detalle.productoId] = producto.precio;
    }

    const nuevo = await Presupuesto.create(
      {
        clienteId,
        usuarioId,
        armadoId,
        fecha,
        fechaVencimiento,
        estado: 'PENDIENTE',
      },
      { transaction: transaccion },
    );

    await PresupuestoDetalle.bulkCreate(
      detalles.map((detalle) => ({
        presupuestoId: nuevo.id,
        productoId: detalle.productoId,
        cantidad: detalle.cantidad,
        precioUnitario: precios[detalle.productoId],
      })),
      { transaction: transaccion },
    );

    return nuevo;
  });

  const presupuestoCompleto = await Presupuesto.findByPk(presupuesto.id, {
    include: [{ model: PresupuestoDetalle, as: 'detalles' }],
  });
  return serializarPresupuesto(presupuestoCompleto);
}

async function cambiarEstado(id, { estado }) {
  const resultado = await sequelize.transaction(async (transaccion) => {
    const presupuesto = await Presupuesto.findByPk(id, {
      lock: transaccion.LOCK.UPDATE,
      transaction: transaccion,
    });

    if (!presupuesto) {
      throw errorDeNegocio('Presupuesto no encontrado', 404);
    }

    if (presupuesto.estado !== 'PENDIENTE') {
      throw errorDeNegocio(
        'Solo se puede aceptar o rechazar un presupuesto PENDIENTE',
        409,
      );
    }

    await presupuesto.update({ estado }, { transaction: transaccion });
    return presupuesto;
  });

  const presupuestoFinal = await Presupuesto.findByPk(resultado.id, {
    include: [{ model: PresupuestoDetalle, as: 'detalles' }],
  });
  return { presupuesto: serializarPresupuesto(presupuestoFinal), estado };
}

async function convertir(id, usuarioId) {
  const resultado = await sequelize.transaction(async (transaccion) => {
    const presupuesto = await Presupuesto.findByPk(id, {
      lock: transaccion.LOCK.UPDATE,
      transaction: transaccion,
    });

    if (!presupuesto) {
      throw errorDeNegocio('Presupuesto no encontrado', 404);
    }

    if (presupuesto.estado !== 'ACEPTADO') {
      throw errorDeNegocio(
        'Solo se puede convertir un presupuesto ACEPTADO',
        409,
      );
    }

    const vigente = presupuesto.fechaVencimiento >= hoy();

    const detalles = await PresupuestoDetalle.findAll({
      where: { presupuestoId: id },
      transaction: transaccion,
    });

    const lineas = detalles.map((detalle) => ({
      productoId: detalle.productoId,
      cantidad: detalle.cantidad,
      precioUnitario: vigente ? detalle.precioUnitario : null,
    }));

    if (presupuesto.armadoId != null) {
      const componentes = await ArmadoComponente.findAll({
        where: { armadoId: presupuesto.armadoId },
        transaction: transaccion,
      });

      for (const componente of componentes) {
        lineas.push({
          productoId: componente.productoId,
          cantidad: componente.cantidad,
          precioUnitario: vigente ? componente.precioUnitario : null,
        });
      }
    }

    const cantidades = {};
    for (const linea of lineas) {
      cantidades[linea.productoId] =
        (cantidades[linea.productoId] ?? 0) + linea.cantidad;
    }

    const productos = {};
    for (const productoId of Object.keys(cantidades)) {
      const producto = await Producto.findByPk(productoId, {
        lock: transaccion.LOCK.UPDATE,
        transaction: transaccion,
      });

      if (!producto) {
        throw errorDeNegocio(
          `El producto ${productoId} del detalle no existe`,
          400,
        );
      }

      if (cantidades[productoId] > producto.stock) {
        throw errorDeNegocio(
          `Stock insuficiente de ${producto.nombre} (disponible: ${producto.stock})`,
          409,
        );
      }

      productos[productoId] = producto;
    }

    for (const linea of lineas) {
      if (linea.precioUnitario == null) {
        linea.precioUnitario = productos[linea.productoId].precio;
      }
    }

    const venta = await Venta.create(
      {
        clienteId: presupuesto.clienteId,
        usuarioId,
        presupuestoId: presupuesto.id,
        fecha: hoy(),
        estado: 'COMPLETADA',
      },
      { transaction: transaccion },
    );

    await VentaDetalle.bulkCreate(
      lineas.map((linea) => ({
        ventaId: venta.id,
        productoId: linea.productoId,
        cantidad: linea.cantidad,
        precioUnitario: linea.precioUnitario,
      })),
      { transaction: transaccion },
    );

    for (const productoId of Object.keys(cantidades)) {
      await productos[productoId].decrement(
        { stock: cantidades[productoId] },
        { transaction: transaccion },
      );
    }

    await presupuesto.update({ estado: 'CONVERTIDO' }, { transaction: transaccion });

    return { ventaId: venta.id, presupuestoId: presupuesto.id };
  });

  const ventaCompleta = await Venta.findByPk(resultado.ventaId, {
    include: [{ model: VentaDetalle, as: 'detalles' }],
  });
  const presupuestoCompleto = await Presupuesto.findByPk(resultado.presupuestoId, {
    include: [{ model: PresupuestoDetalle, as: 'detalles' }],
  });

  return {
    venta: serializarVenta(ventaCompleta),
    presupuesto: serializarPresupuesto(presupuestoCompleto),
  };
}

module.exports = { listar, crear, cambiarEstado, convertir };
