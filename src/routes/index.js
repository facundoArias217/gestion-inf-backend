const { Router } = require('express');

const authRoutes = require('./auth.routes');
const categoriaRoutes = require('./categoria.routes');
const clienteRoutes = require('./cliente.routes');
const productoRoutes = require('./producto.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/clientes', clienteRoutes);
router.use('/productos', productoRoutes);

module.exports = router;
