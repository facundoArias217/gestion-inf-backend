const { Router } = require('express');

const { autenticar, autorizar } = require('../middlewares/auth.middleware');
const controller = require('../controllers/dashboard.controller');

const router = Router();

router.use(autenticar);
router.use(autorizar('ADMIN'));

router.get('/', controller.obtener);

module.exports = router;
