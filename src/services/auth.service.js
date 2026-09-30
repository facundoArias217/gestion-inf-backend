const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const env = require('../config/env');
const { Usuario } = require('../database/models');
const { serializarUsuario } = require('../serializers/usuario.serializer');

function generarToken(usuario) {
  return jwt.sign(
    { sub: usuario.id, rol: usuario.rol },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

async function login({ email, password }) {
  const usuario = await Usuario.findOne({
    where: { email: email.trim().toLowerCase(), activo: true },
  });

  if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  return { token: generarToken(usuario), usuario: serializarUsuario(usuario) };
}

async function me(usuarioId) {
  const usuario = await Usuario.findByPk(usuarioId);

  if (!usuario || !usuario.activo) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    throw error;
  }

  return serializarUsuario(usuario);
}

module.exports = { login, me };
