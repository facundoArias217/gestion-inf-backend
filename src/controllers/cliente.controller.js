const clienteService = require('../services/cliente.service');

async function listar(req, res, next) {
  try {
    const data = await clienteService.listar();
    return res.status(200).json({ message: 'Clientes obtenidos', data });
  } catch (error) {
    return next(error);
  }
}

async function crear(req, res, next) {
  try {
    const data = await clienteService.crear(req.body);
    return res.status(201).json({ message: 'Cliente creado', data });
  } catch (error) {
    return next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const data = await clienteService.actualizar(req.params.id, req.body);
    return res.status(200).json({ message: 'Cliente actualizado', data });
  } catch (error) {
    return next(error);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const { cliente, activo } = await clienteService.cambiarEstado(
      req.params.id,
      req.body,
    );
    const message = activo
      ? 'Cliente reactivado'
      : 'Cliente desactivado';
    return res.status(200).json({ message, data: cliente });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, crear, actualizar, cambiarEstado };
