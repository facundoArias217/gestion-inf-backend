const Joi = require('joi');

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const crearSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(50).required(),
  descripcion: Joi.string().trim().max(200).allow('').default(''),
});

const actualizarSchema = crearSchema;

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

function validarCrearCategoria(req, res, next) {
  return validar(req, res, next, crearSchema, 'body');
}

function validarActualizarCategoria(req, res, next) {
  return validar(req, res, next, actualizarSchema, 'body');
}

function validarEstadoCategoria(req, res, next) {
  return validar(req, res, next, estadoSchema, 'body');
}

module.exports = {
  crearSchema,
  actualizarSchema,
  estadoSchema,
  validarId,
  validarCrearCategoria,
  validarActualizarCategoria,
  validarEstadoCategoria,
};
