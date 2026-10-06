const proveedorService = require('../services/proveedor.service');

async function listar(req, res, next) {
  try {
    const data = await proveedorService.listar();
    return res.status(200).json({ message: 'Proveedores obtenidos', data });
  } catch (error) {
    return next(error);
  }
}

async function crear(req, res, next) {
  try {
    const data = await proveedorService.crear(req.body);
    return res.status(201).json({ message: 'Proveedor creado', data });
  } catch (error) {
    return next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const data = await proveedorService.actualizar(req.params.id, req.body);
    return res.status(200).json({ message: 'Proveedor actualizado', data });
  } catch (error) {
    return next(error);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const { proveedor, activo } = await proveedorService.cambiarEstado(
      req.params.id,
      req.body,
    );
    const message = activo
      ? 'Proveedor reactivado'
      : 'Proveedor desactivado';
    return res.status(200).json({ message, data: proveedor });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, crear, actualizar, cambiarEstado };
