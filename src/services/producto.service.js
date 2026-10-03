const { Categoria, Producto } = require('../database/models');
const {
  serializarProducto,
  serializarProductos,
} = require('../serializers/producto.serializer');

function errorDeNegocio(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

async function validarCategoria(categoriaId) {
  const categoria = await Categoria.findByPk(categoriaId);

  if (!categoria) {
    throw errorDeNegocio('La categoría indicada no existe', 400);
  }

  return categoria;
}

async function listar() {
  const productos = await Producto.findAll({
    order: [['id', 'ASC']],
  });
  return serializarProductos(productos);
}

async function crear({ nombre, marca, descripcion, precio, stock, categoriaId }) {
  await validarCategoria(categoriaId);

  const producto = await Producto.create({
    nombre,
    marca,
    descripcion,
    precio,
    stock,
    categoriaId,
    activo: true,
  });

  return serializarProducto(producto);
}

async function actualizar(id, { nombre, marca, descripcion, precio, stock, categoriaId }) {
  const producto = await Producto.findByPk(id);

  if (!producto) {
    throw errorDeNegocio('Producto no encontrado', 404);
  }

  await validarCategoria(categoriaId);

  await producto.update({ nombre, marca, descripcion, precio, stock, categoriaId });
  return serializarProducto(producto);
}

async function cambiarEstado(id, { activo }) {
  const producto = await Producto.findByPk(id);

  if (!producto) {
    throw errorDeNegocio('Producto no encontrado', 404);
  }

  await producto.update({ activo });
  return { producto: serializarProducto(producto), activo };
}

module.exports = { listar, crear, actualizar, cambiarEstado };
