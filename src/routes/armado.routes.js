const { Router } = require('express');

const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const {
  validarId,
  validarCrearArmado,
  validarActualizarArmado,
  validarEstadoArmado,
} = require('../validators/armado.validator');
const controller = require('../controllers/armado.controller');

const router = Router();

router.use(autenticar);
router.use(autorizar('ADMIN', 'VENDEDOR'));

router.get('/', controller.listar);
router.post('/', validarCrearArmado, controller.crear);
router.post('/:id/duplicar', validarId, controller.duplicar);
router.put('/:id', validarId, validarActualizarArmado, controller.actualizar);
router.patch(
  '/:id/estado',
  validarId,
  validarEstadoArmado,
  controller.cambiarEstado,
);

module.exports = router;
