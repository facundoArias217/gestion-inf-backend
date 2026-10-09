const Joi = require('joi');

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const crearSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(100).required(),
  apellido: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(72).required(),
  rol: Joi.string().valid('ADMIN', 'VENDEDOR').required(),
});

const actualizarSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(100).required(),
  apellido: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(72).optional(),
  rol: Joi.string().valid('ADMIN', 'VENDEDOR').required(),
});

const estadoSchema = Joi.object({
  activo: Joi.boolean().required(),
});

function validar(req, res, next, schema, origen) {
  const { error, value } = schema.validate(origen === 'params' ? req.params : req.body, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: error.details.map((detalle) => detalle.message),
    });
  }

  if (origen === 'params') {
    req.params = value;
  } else {
    req.body = value;
  }

  return next();
}

function validarId(req, res, next) {
  return validar(req, res, next, idSchema, 'params');
}

function validarCrearUsuario(req, res, next) {
  return validar(req, res, next, crearSchema, 'body');
}

function validarActualizarUsuario(req, res, next) {
  return validar(req, res, next, actualizarSchema, 'body');
}

function validarEstadoUsuario(req, res, next) {
  return validar(req, res, next, estadoSchema, 'body');
}

module.exports = {
  crearSchema,
  actualizarSchema,
  estadoSchema,
  validarId,
  validarCrearUsuario,
  validarActualizarUsuario,
  validarEstadoUsuario,
};
