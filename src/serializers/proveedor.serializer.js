const CAMPOS_PUBLICOS = [
  'id',
  'razonSocial',
  'cuit',
  'email',
  'telefono',
  'direccion',
  'activo',
  'createdAt',
  'updatedAt',
];

function serializarProveedor(proveedor) {
  const plano = proveedor.toJSON ? proveedor.toJSON() : proveedor;
  return CAMPOS_PUBLICOS.reduce((dto, campo) => {
    dto[campo] = plano[campo];
    return dto;
  }, {});
}

function serializarProveedores(proveedores) {
  return proveedores.map(serializarProveedor);
}

module.exports = { serializarProveedor, serializarProveedores, CAMPOS_PUBLICOS };
