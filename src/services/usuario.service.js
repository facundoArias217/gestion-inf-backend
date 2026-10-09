const bcrypt = require('bcrypt');
const { Op, where, fn, col } = require('sequelize');

const { Usuario } = require('../database/models');
const {
  serializarUsuario,
  serializarUsuarios,
} = require('../serializers/usuario.serializer');

function errorDeNegocio(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

async function buscarPorEmail(email, idExcluir = null) {
  const condicionEmail = where(fn('lower', col('email')), email.trim().toLowerCase());

  const condicion = idExcluir
    ? { [Op.and]: [condicionEmail, { id: { [Op.ne]: idExcluir } }] }
    : condicionEmail;

  return Usuario.findOne({ where: condicion });
}

async function listar() {
  const usuarios = await Usuario.findAll({
    order: [['id', 'ASC']],
  });
  return serializarUsuarios(usuarios);
}

async function crear({ nombre, apellido, email, password, rol }) {
  if (await buscarPorEmail(email)) {
    throw errorDeNegocio('Ya existe un usuario con ese email', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({
    nombre,
    apellido,
    email: email.trim().toLowerCase(),
    passwordHash,
    rol,
    activo: true,
  });
  return serializarUsuario(usuario);
}

async function actualizar(id, { nombre, apellido, email, password, rol }) {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) {
    throw errorDeNegocio('Usuario no encontrado', 404);
  }

  if (await buscarPorEmail(email, id)) {
    throw errorDeNegocio('Ya existe un usuario con ese email', 409);
  }

  const datos = {
    nombre,
    apellido,
    email: email.trim().toLowerCase(),
    rol,
  };

  if (password != null) {
    datos.passwordHash = await bcrypt.hash(password, 10);
  }

  await usuario.update(datos);
  return serializarUsuario(usuario);
}

async function cambiarEstado(id, { activo }, usuarioAutenticadoId) {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) {
    throw errorDeNegocio('Usuario no encontrado', 404);
  }

  if (Number(id) === Number(usuarioAutenticadoId) && activo === false) {
    throw errorDeNegocio('No podés desactivar tu propio usuario', 409);
  }

  await usuario.update({ activo });
  return { usuario: serializarUsuario(usuario), activo };
}

module.exports = { listar, crear, actualizar, cambiarEstado };
