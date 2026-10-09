const presupuestoService = require('../services/presupuesto.service');

async function listar(req, res, next) {
  try {
    const data = await presupuestoService.listar();
    return res.status(200).json({ message: 'Presupuestos obtenidos', data });
  } catch (error) {
    return next(error);
  }
}

async function crear(req, res, next) {
  try {
    const data = await presupuestoService.crear(req.body, req.usuario.id);
    return res.status(201).json({ message: 'Presupuesto registrado', data });
  } catch (error) {
    return next(error);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const { presupuesto, estado } = await presupuestoService.cambiarEstado(
      req.params.id,
      req.body,
    );
    const message =
      estado === 'ACEPTADO'
        ? 'Presupuesto aceptado'
        : 'Presupuesto rechazado';
    return res.status(200).json({ message, data: presupuesto });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, crear, cambiarEstado };
