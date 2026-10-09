const pagoService = require('../services/pago.service');

async function listar(req, res, next) {
  try {
    const data = await pagoService.listar(req.filtro);
    return res.status(200).json({ message: 'Pagos obtenidos', data });
  } catch (error) {
    return next(error);
  }
}

async function crear(req, res, next) {
  try {
    const data = await pagoService.crear(req.body);
    return res.status(201).json({ message: 'Pago registrado', data });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, crear };
