const { Router } = require('express');

const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const {
  validarId,
  validarCrearCompra,
  validarEstadoCompra,
} = require('../validators/compra.validator');
const controller = require('../controllers/compra.controller');

const router = Router();

router.use(autenticar);
router.use(autorizar('ADMIN'));

router.get('/', controller.listar);
router.post('/', validarCrearCompra, controller.crear);
router.patch(
  '/:id/estado',
  validarId,
  validarEstadoCompra,
  controller.cambiarEstado,
);

module.exports = router;
