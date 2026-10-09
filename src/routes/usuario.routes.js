const { Router } = require('express');

const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const {
  validarId,
  validarCrearUsuario,
  validarActualizarUsuario,
  validarEstadoUsuario,
} = require('../validators/usuario.validator');
const controller = require('../controllers/usuario.controller');

const router = Router();

router.use(autenticar);
router.use(autorizar('ADMIN'));

router.get('/', controller.listar);
router.post('/', validarCrearUsuario, controller.crear);
router.put('/:id', validarId, validarActualizarUsuario, controller.actualizar);
router.patch(
  '/:id/estado',
  validarId,
  validarEstadoUsuario,
  controller.cambiarEstado,
);

module.exports = router;
