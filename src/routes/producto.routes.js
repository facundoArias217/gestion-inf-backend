const { Router } = require('express');

const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const {
  validarId,
  validarCrearProducto,
  validarActualizarProducto,
  validarEstadoProducto,
} = require('../validators/producto.validator');
const controller = require('../controllers/producto.controller');

const router = Router();

router.use(autenticar);

router.get('/', autorizar('ADMIN', 'VENDEDOR'), controller.listar);
router.post('/', autorizar('ADMIN'), validarCrearProducto, controller.crear);
router.put(
  '/:id',
  autorizar('ADMIN'),
  validarId,
  validarActualizarProducto,
  controller.actualizar,
);
router.patch(
  '/:id/estado',
  autorizar('ADMIN'),
  validarId,
  validarEstadoProducto,
  controller.cambiarEstado,
);

module.exports = router;
