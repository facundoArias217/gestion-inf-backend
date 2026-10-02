const { Router } = require('express');

const authRoutes = require('./auth.routes');
const categoriaRoutes = require('./categoria.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/categorias', categoriaRoutes);

module.exports = router;
