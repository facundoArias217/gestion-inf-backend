const CAMPOS_PUBLICOS = ['id', 'nombre', 'apellido', 'email', 'rol', 'activo', 'createdAt', 'updatedAt'];

function serializarUsuario(usuario) {
  const plano = usuario.toJSON ? usuario.toJSON() : usuario;
  return CAMPOS_PUBLICOS.reduce((dto, campo) => {
    dto[campo] = plano[campo];
    return dto;
  }, {});
}

function serializarUsuarios(usuarios) {
  return usuarios.map(serializarUsuario);
}

module.exports = { serializarUsuario, serializarUsuarios, CAMPOS_PUBLICOS };
