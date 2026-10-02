const categoriaService = require('../services/categoria.service');

async function listar(req, res, next) {
  try {
    const data = await categoriaService.listar();
    return res.status(200).json({ message: 'Categorías obtenidas', data });
  } catch (error) {
    return next(error);
  }
}

async function crear(req, res, next) {
  try {
    const data = await categoriaService.crear(req.body);
    return res.status(201).json({ message: 'Categoría creada', data });
  } catch (error) {
    return next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const data = await categoriaService.actualizar(req.params.id, req.body);
    return res.status(200).json({ message: 'Categoría actualizada', data });
  } catch (error) {
    return next(error);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const { categoria, activo } = await categoriaService.cambiarEstado(
      req.params.id,
      req.body,
    );
    const message = activo
      ? 'Categoría reactivada'
      : 'Categoría desactivada';
    return res.status(200).json({ message, data: categoria });
  } catch (error) {
    return next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    await categoriaService.eliminar(req.params.id);
    return res
      .status(200)
      .json({ message: 'Categoría eliminada definitivamente', data: null });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, crear, actualizar, cambiarEstado, eliminar };
