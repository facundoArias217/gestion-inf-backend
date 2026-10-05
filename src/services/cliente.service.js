const { Op } = require('sequelize');

const { Cliente } = require('../database/models');
const {
  serializarCliente,
  serializarClientes,
} = require('../serializers/cliente.serializer');

function errorDeNegocio(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

async function buscarPorCuil(cuil, idExcluir = null) {
  const condicion = idExcluir
    ? { [Op.and]: [{ cuil }, { id: { [Op.ne]: idExcluir } }] }
    : { cuil };

  return Cliente.findOne({ where: condicion });
}

async function listar() {
  const clientes = await Cliente.findAll({
    order: [['id', 'ASC']],
  });
  return serializarClientes(clientes);
}

async function crear({ nombre, apellido, cuil, email, telefono, direccion }) {
  if (await buscarPorCuil(cuil)) {
    throw errorDeNegocio('Ya existe un cliente con ese CUIT/CUIL', 409);
  }

  const cliente = await Cliente.create({
    nombre,
    apellido,
    cuil,
    email,
    telefono,
    direccion,
    activo: true,
  });

  return serializarCliente(cliente);
}

async function actualizar(id, { nombre, apellido, cuil, email, telefono, direccion }) {
  const cliente = await Cliente.findByPk(id);

  if (!cliente) {
    throw errorDeNegocio('Cliente no encontrado', 404);
  }

  if (await buscarPorCuil(cuil, id)) {
    throw errorDeNegocio('Ya existe un cliente con ese CUIT/CUIL', 409);
  }

  await cliente.update({ nombre, apellido, cuil, email, telefono, direccion });
  return serializarCliente(cliente);
}

async function cambiarEstado(id, { activo }) {
  const cliente = await Cliente.findByPk(id);

  if (!cliente) {
    throw errorDeNegocio('Cliente no encontrado', 404);
  }

  await cliente.update({ activo });
  return { cliente: serializarCliente(cliente), activo };
}

module.exports = { listar, crear, actualizar, cambiarEstado };
