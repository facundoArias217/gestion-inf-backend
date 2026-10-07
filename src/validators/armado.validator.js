const Joi = require('joi');

const CATEGORIAS_OBLIGATORIAS_NOMBRES = [
  'Procesador',
  'Motherboard',
  'Memoria RAM',
  'Almacenamiento',
  'Fuente',
  'Gabinete',
];

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const componenteSchema = Joi.object({
  productoId: Joi.number().integer().positive().required(),
  cantidad: Joi.number().integer().min(1).required(),
});

const crearSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(100).required(),
  descripcion: Joi.string().trim().max(200).allow('').default(''),
  clienteId: Joi.number().integer().positive().allow(null).optional(),
  componentes: Joi.array().items(componenteSchema).min(1).required(),
});

const actualizarSchema = crearSchema;

const estadoSchema = Joi.object({
  estado: Joi.string().valid('FINALIZADO').required(),
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

function validarCrearArmado(req, res, next) {
  return validar(req, res, next, crearSchema, 'body');
}

function validarActualizarArmado(req, res, next) {
  return validar(req, res, next, actualizarSchema, 'body');
}

function validarEstadoArmado(req, res, next) {
  return validar(req, res, next, estadoSchema, 'body');
}

module.exports = {
  CATEGORIAS_OBLIGATORIAS_NOMBRES,
  crearSchema,
  actualizarSchema,
  estadoSchema,
  validarId,
  validarCrearArmado,
  validarActualizarArmado,
  validarEstadoArmado,
};
