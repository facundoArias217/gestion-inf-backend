const CAMPOS_PUBLICOS = [
  'id',
  'nombre',
  'apellido',
  'cuil',
  'email',
  'telefono',
  'direccion',
  'activo',
  'createdAt',
  'updatedAt',
];

function serializarCliente(cliente) {
  const plano = cliente.toJSON ? cliente.toJSON() : cliente;
  return CAMPOS_PUBLICOS.reduce((dto, campo) => {
    dto[campo] = plano[campo];
    return dto;
  }, {});
}

function serializarClientes(clientes) {
  return clientes.map(serializarCliente);
}

module.exports = { serializarCliente, serializarClientes, CAMPOS_PUBLICOS };
