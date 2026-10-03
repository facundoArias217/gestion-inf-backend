const productoService = require('../services/producto.service');

async function listar(req, res, next) {
  try {
    const data = await productoService.listar();
    return res.status(200).json({ message: 'Productos obtenidos', data });
  } catch (error) {
    return next(error);
  }
}

async function crear(req, res, next) {
  try {
    const data = await productoService.crear(req.body);
    return res.status(201).json({ message: 'Producto creado', data });
  } catch (error) {
    return next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const data = await productoService.actualizar(req.params.id, req.body);
    return res.status(200).json({ message: 'Producto actualizado', data });
  } catch (error) {
    return next(error);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const { producto, activo } = await productoService.cambiarEstado(
      req.params.id,
      req.body,
    );
    const message = activo
      ? 'Producto reactivado'
      : 'Producto desactivado';
    return res.status(200).json({ message, data: producto });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, crear, actualizar, cambiarEstado };
