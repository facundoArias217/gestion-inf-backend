const { Op } = require('sequelize');

const { Proveedor } = require('../database/models');
const {
  serializarProveedor,
  serializarProveedores,
} = require('../serializers/proveedor.serializer');

function errorDeNegocio(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

async function buscarPorCuit(cuit, idExcluir = null) {
  const condicion = idExcluir
    ? { [Op.and]: [{ cuit }, { id: { [Op.ne]: idExcluir } }] }
    : { cuit };

  return Proveedor.findOne({ where: condicion });
}

async function listar() {
  const proveedores = await Proveedor.findAll({
    order: [['id', 'ASC']],
  });
  return serializarProveedores(proveedores);
}

async function crear({ razonSocial, cuit, email, telefono, direccion }) {
  if (await buscarPorCuit(cuit)) {
    throw errorDeNegocio('Ya existe un proveedor con ese CUIT/CUIL', 409);
  }

  const proveedor = await Proveedor.create({
    razonSocial,
    cuit,
    email,
    telefono,
    direccion,
    activo: true,
  });

  return serializarProveedor(proveedor);
}

async function actualizar(id, { razonSocial, cuit, email, telefono, direccion }) {
  const proveedor = await Proveedor.findByPk(id);

  if (!proveedor) {
    throw errorDeNegocio('Proveedor no encontrado', 404);
  }

  if (await buscarPorCuit(cuit, id)) {
    throw errorDeNegocio('Ya existe un proveedor con ese CUIT/CUIL', 409);
  }

  await proveedor.update({ razonSocial, cuit, email, telefono, direccion });
  return serializarProveedor(proveedor);
}

async function cambiarEstado(id, { activo }) {
  const proveedor = await Proveedor.findByPk(id);

  if (!proveedor) {
    throw errorDeNegocio('Proveedor no encontrado', 404);
  }

  await proveedor.update({ activo });
  return { proveedor: serializarProveedor(proveedor), activo };
}

module.exports = { listar, crear, actualizar, cambiarEstado };
