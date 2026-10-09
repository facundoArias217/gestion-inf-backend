const Joi = require('joi');

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const detalleSchema = Joi.object({
  productoId: Joi.number().integer().positive().required(),
  cantidad: Joi.number().integer().min(1).required(),
});

const crearSchema = Joi.object({
  clienteId: Joi.number().integer().positive().required(),
  fecha: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .message('"fecha" debe tener formato YYYY-MM-DD')
    .required(),
  fechaVencimiento: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .message('"fechaVencimiento" debe tener formato YYYY-MM-DD')
    .required(),
  armadoId: Joi.number().integer().positive().allow(null).optional(),
  detalles: Joi.array().items(detalleSchema).default([]),
});

const estadoSchema = Joi.object({
  estado: Joi.string().valid('ACEPTADO', 'RECHAZADO').required(),
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

function validarCrearPresupuesto(req, res, next) {
  return validar(req, res, next, crearSchema, 'body');
}

function validarEstadoPresupuesto(req, res, next) {
  return validar(req, res, next, estadoSchema, 'body');
}

module.exports = {
  crearSchema,
  estadoSchema,
  validarId,
  validarCrearPresupuesto,
  validarEstadoPresupuesto,
};
