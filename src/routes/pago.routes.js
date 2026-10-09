const { Router } = require('express');

const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const { validarCrearPago, validarFiltro } = require('../validators/pago.validator');
const controller = require('../controllers/pago.controller');

const router = Router();

router.use(autenticar);
router.use(autorizar('ADMIN', 'VENDEDOR'));

router.get('/', validarFiltro, controller.listar);
router.post('/', validarCrearPago, controller.crear);

module.exports = router;
