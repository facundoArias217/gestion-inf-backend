const armadoService = require('../services/armado.service');

async function listar(req, res, next) {
  try {
    const data = await armadoService.listar();
    return res.status(200).json({ message: 'Armados obtenidos', data });
  } catch (error) {
    return next(error);
  }
}

async function crear(req, res, next) {
  try {
    const data = await armadoService.crear(req.body, req.usuario.id);
    return res.status(201).json({ message: 'Armado registrado', data });
  } catch (error) {
    return next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const data = await armadoService.actualizar(req.params.id, req.body);
    return res.status(200).json({ message: 'Armado actualizado', data });
  } catch (error) {
    return next(error);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const { armado, estado } = await armadoService.cambiarEstado(
      req.params.id,
      req.body,
    );
    const message =
      estado === 'FINALIZADO' ? 'Armado finalizado' : 'Armado actualizado';
    return res.status(200).json({ message, data: armado });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, crear, actualizar, cambiarEstado };
