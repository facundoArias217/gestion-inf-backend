const Joi = require('joi');

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const detalleSchema = Joi.object({
  productoId: Joi.number().integer().positive().required(),
  cantidad: Joi.number().integer().min(1).required(),
  precioUnitario: Joi.number().positive().required(),
});

const crearSchema = Joi.object({
  clienteId: Joi.number().integer().positive().required(),
  fecha: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .message('"fecha" debe tener formato YYYY-MM-DD')
    .required(),
  detalles: Joi.array().items(detalleSchema).min(1).required(),
});

const estadoSchema = Joi.object({
  estado: Joi.string().valid('CANCELADA').required(),
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

function validarCrearVenta(req, res, next) {
  return validar(req, res, next, crearSchema, 'body');
}

function validarEstadoVenta(req, res, next) {
  return validar(req, res, next, estadoSchema, 'body');
}

module.exports = {
  crearSchema,
  estadoSchema,
  validarId,
  validarCrearVenta,
  validarEstadoVenta,
};
