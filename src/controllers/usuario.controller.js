const usuarioService = require('../services/usuario.service');

async function listar(req, res, next) {
  try {
    const data = await usuarioService.listar();
    return res.status(200).json({ message: 'Usuarios obtenidos', data });
  } catch (error) {
    return next(error);
  }
}

async function crear(req, res, next) {
  try {
    const data = await usuarioService.crear(req.body);
    return res.status(201).json({ message: 'Usuario registrado', data });
  } catch (error) {
    return next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const data = await usuarioService.actualizar(req.params.id, req.body);
    return res.status(200).json({ message: 'Usuario actualizado', data });
  } catch (error) {
    return next(error);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const { usuario, activo } = await usuarioService.cambiarEstado(
      req.params.id,
      req.body,
      req.usuario.id,
    );
    const message = activo ? 'Usuario reactivado' : 'Usuario desactivado';
    return res.status(200).json({ message, data: usuario });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, crear, actualizar, cambiarEstado };
