const { Router } = require('express');

const authRoutes = require('./auth.routes');
const categoriaRoutes = require('./categoria.routes');
const clienteRoutes = require('./cliente.routes');
const productoRoutes = require('./producto.routes');
const proveedorRoutes = require('./proveedor.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/clientes', clienteRoutes);
router.use('/productos', productoRoutes);
router.use('/proveedores', proveedorRoutes);

module.exports = router;
