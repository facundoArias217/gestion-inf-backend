const compraService = require('../services/compra.service');

async function listar(req, res, next) {
  try {
    const data = await compraService.listar();
    return res.status(200).json({ message: 'Compras obtenidas', data });
  } catch (error) {
    return next(error);
  }
}

async function crear(req, res, next) {
  try {
    const data = await compraService.crear(req.body, req.usuario.id);
    return res.status(201).json({ message: 'Compra registrada', data });
  } catch (error) {
    return next(error);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const { compra, estado } = await compraService.cambiarEstado(
      req.params.id,
      req.body,
    );
    const message =
      estado === 'COMPLETADA' ? 'Compra confirmada' : 'Compra cancelada';
    return res.status(200).json({ message, data: compra });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, crear, cambiarEstado };
