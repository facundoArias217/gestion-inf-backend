const ventaService = require('../services/venta.service');

async function listar(req, res, next) {
  try {
    const data = await ventaService.listar();
    return res.status(200).json({ message: 'Ventas obtenidas', data });
  } catch (error) {
    return next(error);
  }
}

async function crear(req, res, next) {
  try {
    const data = await ventaService.crear(req.body, req.usuario.id);
    return res.status(201).json({ message: 'Venta registrada', data });
  } catch (error) {
    return next(error);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const { venta, estado } = await ventaService.cambiarEstado(
      req.params.id,
      req.body,
    );
    const message =
      estado === 'CANCELADA' ? 'Venta cancelada' : 'Venta actualizada';
    return res.status(200).json({ message, data: venta });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, crear, cambiarEstado };
