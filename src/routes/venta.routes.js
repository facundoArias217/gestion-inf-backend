const { Router } = require('express');

const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const {
  validarId,
  validarCrearVenta,
  validarEstadoVenta,
} = require('../validators/venta.validator');
const controller = require('../controllers/venta.controller');

const router = Router();

router.use(autenticar);
router.use(autorizar('ADMIN', 'VENDEDOR'));

router.get('/', controller.listar);
router.post('/', validarCrearVenta, controller.crear);
router.patch(
  '/:id/estado',
  validarId,
  validarEstadoVenta,
  controller.cambiarEstado,
);

module.exports = router;
