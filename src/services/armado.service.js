const {
  Armado,
  ArmadoComponente,
  Categoria,
  Cliente,
  Producto,
  sequelize,
} = require('../database/models');
const {
  serializarArmado,
  serializarArmados,
} = require('../serializers/armado.serializer');
const { CATEGORIAS_OBLIGATORIAS_NOMBRES } = require('../validators/armado.validator');

function errorDeNegocio(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

async function cargarProducto(componente, transaccion) {
  const producto = await Producto.findByPk(componente.productoId, {
    lock: transaccion.LOCK.UPDATE,
    transaction: transaccion,
  });

  if (!producto) {
    throw errorDeNegocio(
      `El producto ${componente.productoId} no existe`,
      400,
    );
  }

  if (componente.cantidad > producto.stock) {
    throw errorDeNegocio(
      `Stock insuficiente de ${producto.nombre} (disponible: ${producto.stock})`,
      409,
    );
  }

  return producto;
}

async function validarEncabezado({ clienteId }) {
  if (clienteId != null) {
    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      throw errorDeNegocio('El cliente indicado no existe', 400);
    }
  }
}

async function listar() {
  const armados = await Armado.findAll({
    include: [{ model: ArmadoComponente, as: 'componentes' }],
    order: [['id', 'ASC']],
  });
  return serializarArmados(armados);
}

async function crear({ nombre, descripcion, clienteId, componentes }, usuarioId) {
  await validarEncabezado({ clienteId });

  const armado = await sequelize.transaction(async (transaccion) => {
    const precios = {};
    for (const componente of componentes) {
      const producto = await cargarProducto(componente, transaccion);
      precios[componente.productoId] = producto.precio;
    }

    const nuevo = await Armado.create(
      { nombre, descripcion, clienteId, usuarioId, estado: 'BORRADOR' },
      { transaction: transaccion },
    );

    await ArmadoComponente.bulkCreate(
      componentes.map((componente) => ({
        armadoId: nuevo.id,
        productoId: componente.productoId,
        cantidad: componente.cantidad,
        precioUnitario: precios[componente.productoId],
      })),
      { transaction: transaccion },
    );

    return nuevo;
  });

  const armadoCompleto = await Armado.findByPk(armado.id, {
    include: [{ model: ArmadoComponente, as: 'componentes' }],
  });
  return serializarArmado(armadoCompleto);
}

async function actualizar(id, { nombre, descripcion, clienteId, componentes }) {
  await validarEncabezado({ clienteId });

  await sequelize.transaction(async (transaccion) => {
    const armado = await Armado.findByPk(id, {
      lock: transaccion.LOCK.UPDATE,
      transaction: transaccion,
    });

    if (!armado) {
      throw errorDeNegocio('Armado no encontrado', 404);
    }

    if (armado.estado !== 'BORRADOR') {
      throw errorDeNegocio('Solo se puede editar un armado en BORRADOR', 409);
    }

    const precios = {};
    for (const componente of componentes) {
      const producto = await cargarProducto(componente, transaccion);
      precios[componente.productoId] = producto.precio;
    }

    await armado.update(
      { nombre, descripcion, clienteId },
      { transaction: transaccion },
    );

    await ArmadoComponente.destroy({
      where: { armadoId: id },
      transaction: transaccion,
    });

    await ArmadoComponente.bulkCreate(
      componentes.map((componente) => ({
        armadoId: id,
        productoId: componente.productoId,
        cantidad: componente.cantidad,
        precioUnitario: precios[componente.productoId],
      })),
      { transaction: transaccion },
    );
  });

  const armadoCompleto = await Armado.findByPk(id, {
    include: [{ model: ArmadoComponente, as: 'componentes' }],
  });
  return serializarArmado(armadoCompleto);
}

async function categoriasFaltantes(componentes) {
  const categorias = await Categoria.findAll();
  const categoriasObligatorias = CATEGORIAS_OBLIGATORIAS_NOMBRES.map(
    (nombre) => categorias.find((c) => c.nombre === nombre),
  ).filter((categoria) => categoria != null);

  const presentes = new Set();
  for (const componente of componentes) {
    const producto = await Producto.findByPk(componente.productoId);
    if (producto) {
      presentes.add(producto.categoriaId);
    }
  }

  return categoriasObligatorias
    .filter((categoria) => !presentes.has(categoria.id))
    .map((categoria) => categoria.nombre);
}

async function cambiarEstado(id, { estado }) {
  const resultado = await sequelize.transaction(async (transaccion) => {
    const armado = await Armado.findByPk(id, {
      lock: transaccion.LOCK.UPDATE,
      transaction: transaccion,
    });

    if (!armado) {
      throw errorDeNegocio('Armado no encontrado', 404);
    }

    if (armado.estado !== 'BORRADOR') {
      throw errorDeNegocio('Solo se puede finalizar un armado en BORRADOR', 409);
    }

    const componentes = await ArmadoComponente.findAll({
      where: { armadoId: id },
      transaction: transaccion,
    });

    const faltantes = await categoriasFaltantes(componentes);
    if (faltantes.length > 0) {
      throw errorDeNegocio(
        `El armado no está completo: faltan ${faltantes.join(', ')}`,
        409,
      );
    }

    await armado.update({ estado }, { transaction: transaccion });
    return armado;
  });

  const armadoCompleto = await Armado.findByPk(resultado.id, {
    include: [{ model: ArmadoComponente, as: 'componentes' }],
  });
  return { armado: serializarArmado(armadoCompleto), estado };
}

async function duplicar(id, usuarioId) {
  const original = await Armado.findByPk(id, {
    include: [{ model: ArmadoComponente, as: 'componentes' }],
  });

  if (!original) {
    throw errorDeNegocio('Armado no encontrado', 404);
  }

  if (original.componentes.length === 0) {
    throw errorDeNegocio(
      'El armado no tiene componentes para duplicar',
      400,
    );
  }

  return crear(
    {
      nombre: `${original.nombre} (copia)`,
      descripcion: original.descripcion,
      clienteId: null,
      componentes: original.componentes.map((componente) => ({
        productoId: componente.productoId,
        cantidad: componente.cantidad,
      })),
    },
    usuarioId,
  );
}

module.exports = { listar, crear, actualizar, cambiarEstado, duplicar };
