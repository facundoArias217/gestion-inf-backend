const { Router } = require('express');

const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const {
  validarId,
  validarCrearCategoria,
  validarActualizarCategoria,
  validarEstadoCategoria,
} = require('../validators/categoria.validator');
const controller = require('../controllers/categoria.controller');

const router = Router();

router.use(autenticar);

router.get('/', autorizar('ADMIN', 'VENDEDOR'), controller.listar);
router.post('/', autorizar('ADMIN'), validarCrearCategoria, controller.crear);
router.put(
  '/:id',
  autorizar('ADMIN'),
  validarId,
  validarActualizarCategoria,
  controller.actualizar,
);
router.patch(
  '/:id/estado',
  autorizar('ADMIN'),
  validarId,
  validarEstadoCategoria,
  controller.cambiarEstado,
);

module.exports = router;
