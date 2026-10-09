const { Router } = require('express');

const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const {
  validarId,
  validarCrearPresupuesto,
  validarEstadoPresupuesto,
} = require('../validators/presupuesto.validator');
const controller = require('../controllers/presupuesto.controller');

const router = Router();

router.use(autenticar);
router.use(autorizar('ADMIN', 'VENDEDOR'));

router.get('/', controller.listar);
router.post('/', validarCrearPresupuesto, controller.crear);
router.post('/:id/convertir', validarId, controller.convertir);
router.patch(
  '/:id/estado',
  validarId,
  validarEstadoPresupuesto,
  controller.cambiarEstado,
);

module.exports = router;
