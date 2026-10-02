const { Op, where, fn, col } = require('sequelize');

const { Categoria } = require('../database/models');
const {
  serializarCategoria,
  serializarCategorias,
} = require('../serializers/categoria.serializer');

function errorDeNegocio(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

function nombreNormalizado(nombre) {
  return nombre.trim().toLowerCase();
}

async function buscarPorNombre(nombre, idExcluir = null) {
  const condicionNombre = where(
    fn('lower', col('nombre')),
    nombreNormalizado(nombre),
  );

  const condicion = idExcluir
    ? { [Op.and]: [condicionNombre, { id: { [Op.ne]: idExcluir } }] }
    : condicionNombre;

  return Categoria.findOne({ where: condicion });
}

async function listar() {
  const categorias = await Categoria.findAll({
    order: [['nombre', 'ASC']],
  });
  return serializarCategorias(categorias);
}

async function crear({ nombre, descripcion }) {
  if (await buscarPorNombre(nombre)) {
    throw errorDeNegocio('Ya existe una categoría con ese nombre', 409);
  }

  const categoria = await Categoria.create({ nombre, descripcion, activo: true });
  return serializarCategoria(categoria);
}

async function actualizar(id, { nombre, descripcion }) {
  const categoria = await Categoria.findByPk(id);

  if (!categoria) {
    throw errorDeNegocio('Categoría no encontrada', 404);
  }

  if (await buscarPorNombre(nombre, id)) {
    throw errorDeNegocio('Ya existe una categoría con ese nombre', 409);
  }

  await categoria.update({ nombre, descripcion });
  return serializarCategoria(categoria);
}

async function cambiarEstado(id, { activo }) {
  const categoria = await Categoria.findByPk(id);

  if (!categoria) {
    throw errorDeNegocio('Categoría no encontrada', 404);
  }

  await categoria.update({ activo });
  return { categoria: serializarCategoria(categoria), activo };
}

module.exports = { listar, crear, actualizar, cambiarEstado };
