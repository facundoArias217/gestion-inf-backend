const { Router } = require('express');

const { autenticar } = require('../middlewares/auth.middleware');
const { validarLogin } = require('../validators/auth.validator');
const controller = require('../controllers/auth.controller');

const router = Router();

router.post('/login', validarLogin, controller.login);
router.get('/me', autenticar, controller.me);

module.exports = router;
