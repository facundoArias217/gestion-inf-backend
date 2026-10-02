const CAMPOS_PUBLICOS = ['id', 'nombre', 'descripcion', 'activo', 'createdAt', 'updatedAt'];

function serializarCategoria(categoria) {
  const plano = categoria.toJSON ? categoria.toJSON() : categoria;
  return CAMPOS_PUBLICOS.reduce((dto, campo) => {
    dto[campo] = plano[campo];
    return dto;
  }, {});
}

function serializarCategorias(categorias) {
  return categorias.map(serializarCategoria);
}

module.exports = { serializarCategoria, serializarCategorias, CAMPOS_PUBLICOS };
