const { Router } = require('express');

const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const {
  validarId,
  validarCrearCliente,
  validarActualizarCliente,
  validarEstadoCliente,
} = require('../validators/cliente.validator');
const controller = require('../controllers/cliente.controller');

const router = Router();

router.use(autenticar);
router.use(autorizar('ADMIN', 'VENDEDOR'));

router.get('/', controller.listar);
router.post('/', validarCrearCliente, controller.crear);
router.put('/:id', validarId, validarActualizarCliente, controller.actualizar);
router.patch(
  '/:id/estado',
  validarId,
  validarEstadoCliente,
  controller.cambiarEstado,
);

module.exports = router;
