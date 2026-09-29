const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const resultado = await authService.login(req.body);
    return res.status(200).json({ message: 'Sesión iniciada', data: resultado });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const usuario = await authService.me(req.usuario.id);
    return res.status(200).json({ message: 'Usuario autenticado', data: usuario });
  } catch (error) {
    return next(error);
  }
}

module.exports = { login, me };
