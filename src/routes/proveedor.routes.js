const { Router } = require('express');

const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const {
  validarId,
  validarCrearProveedor,
  validarActualizarProveedor,
  validarEstadoProveedor,
} = require('../validators/proveedor.validator');
const controller = require('../controllers/proveedor.controller');

const router = Router();

router.use(autenticar);
router.use(autorizar('ADMIN'));

router.get('/', controller.listar);
router.post('/', validarCrearProveedor, controller.crear);
router.put('/:id', validarId, validarActualizarProveedor, controller.actualizar);
router.patch(
  '/:id/estado',
  validarId,
  validarEstadoProveedor,
  controller.cambiarEstado,
);

module.exports = router;
