const Joi = require('joi');

const PESOS_CUIT = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
const PREFIJOS_PERSONA = ['20', '23', '24', '27'];
const PREFIJOS_EMPRESA = ['30', '33', '34'];
const PREFIJOS_TODOS = [...PREFIJOS_PERSONA, ...PREFIJOS_EMPRESA];

function esCuitValido(cuit) {
  const digitos = String(cuit);

  if (!/^\d{11}$/.test(digitos)) {
    return false;
  }

  if (!PREFIJOS_TODOS.includes(digitos.slice(0, 2))) {
    return false;
  }

  const suma = digitos
    .slice(0, 10)
    .split('')
    .reduce((acum, digito, i) => acum + Number(digito) * PESOS_CUIT[i], 0);
  const verificador = 11 - (suma % 11);
  const esperado = verificador === 11 ? 0 : verificador;

  return esperado !== 10 && Number(digitos[10]) === esperado;
}

const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const crearSchema = Joi.object({
  razonSocial: Joi.string().trim().min(1).max(100).required(),
  cuit: Joi.string()
    .trim()
    .pattern(/^\d{11}$/)
    .message('"cuit" debe tener 11 dígitos')
    .required()
    .custom((valor, helpers) =>
      esCuitValido(valor)
        ? valor
        : helpers.error('any.invalid', { message: 'El CUIT/CUIL es inválido' }),
    )
    .messages({
      'any.invalid': 'El CUIT/CUIL es inválido',
    }),
  email: Joi.string().trim().email().max(100).required(),
  telefono: Joi.string().trim().min(1).max(20).required(),
  direccion: Joi.string().trim().min(1).max(100).required(),
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

function validarCrearProveedor(req, res, next) {
  return validar(req, res, next, crearSchema, 'body');
}

function validarActualizarProveedor(req, res, next) {
  return validar(req, res, next, actualizarSchema, 'body');
}

function validarEstadoProveedor(req, res, next) {
  return validar(req, res, next, estadoSchema, 'body');
}

module.exports = {
  crearSchema,
  actualizarSchema,
  estadoSchema,
  esCuitValido,
  validarId,
  validarCrearProveedor,
  validarActualizarProveedor,
  validarEstadoProveedor,
};
