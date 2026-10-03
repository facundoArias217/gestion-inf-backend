const CAMPOS_PUBLICOS = [
  'id',
  'nombre',
  'marca',
  'descripcion',
  'stock',
  'categoriaId',
  'activo',
  'createdAt',
  'updatedAt',
];

function serializarProducto(producto) {
  const plano = producto.toJSON ? producto.toJSON() : producto;
  const dto = CAMPOS_PUBLICOS.reduce((resultado, campo) => {
    resultado[campo] = plano[campo];
    return resultado;
  }, {});
  dto.precio = Number(plano.precio);
  return dto;
}

function serializarProductos(productos) {
  return productos.map(serializarProducto);
}

module.exports = { serializarProducto, serializarProductos, CAMPOS_PUBLICOS };
