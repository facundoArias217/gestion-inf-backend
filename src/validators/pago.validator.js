const Joi = require('joi');

const crearSchema = Joi.object({
  ventaId: Joi.number().integer().positive().required(),
  medioPago: Joi.string().valid('EFECTIVO', 'TRANSFERENCIA', 'TARJETA').required(),
  monto: Joi.number().positive().required(),
  resultado: Joi.string().valid('APROBADO', 'RECHAZADO').required(),
  fecha: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .message('"fecha" debe tener formato YYYY-MM-DD')
    .required(),
});

const filtroSchema = Joi.object({
  ventaId: Joi.number().integer().positive(),
});

function responderInvalido(res, error) {
  return res.status(400).json({
    message: 'Datos inválidos',
    errors: error.details.map((detalle) => detalle.message),
  });
}

function validarCrearPago(req, res, next) {
  const { error, value } = crearSchema.validate(req.body, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    return responderInvalido(res, error);
  }

  req.body = value;
  return next();
}

function validarFiltro(req, res, next) {
  const { error, value } = filtroSchema.validate(req.query, {
    abortEarly: false,
    convert: true,
    stripUnknown: true,
  });

  if (error) {
    return responderInvalido(res, error);
  }

  req.filtro = value;
  return next();
}

module.exports = { crearSchema, filtroSchema, validarCrearPago, validarFiltro };
