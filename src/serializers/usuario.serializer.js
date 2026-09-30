const CAMPOS_PUBLICOS = ['id', 'nombre', 'apellido', 'email', 'rol'];

function serializarUsuario(usuario) {
  const plano = usuario.toJSON ? usuario.toJSON() : usuario;
  return CAMPOS_PUBLICOS.reduce((dto, campo) => {
    dto[campo] = plano[campo];
    return dto;
  }, {});
}

module.exports = { serializarUsuario, CAMPOS_PUBLICOS };
