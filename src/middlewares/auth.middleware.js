const jwt = require('jsonwebtoken');

const env = require('../config/env');

function autenticar(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.usuario = { id: payload.sub, rol: payload.rol };
    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

function autorizar(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res
        .status(403)
        .json({ message: 'No tenés permisos para realizar esta operación' });
    }
    return next();
  };
}

module.exports = { autenticar, autorizar };
