const { Router } = require('express');

const armadoRoutes = require('./armado.routes');
const authRoutes = require('./auth.routes');
const categoriaRoutes = require('./categoria.routes');
const clienteRoutes = require('./cliente.routes');
const compraRoutes = require('./compra.routes');
const dashboardRoutes = require('./dashboard.routes');
const pagoRoutes = require('./pago.routes');
const presupuestoRoutes = require('./presupuesto.routes');
const productoRoutes = require('./producto.routes');
const proveedorRoutes = require('./proveedor.routes');
const usuarioRoutes = require('./usuario.routes');
const ventaRoutes = require('./venta.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/armados', armadoRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/clientes', clienteRoutes);
router.use('/compras', compraRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/pagos', pagoRoutes);
router.use('/presupuestos', presupuestoRoutes);
router.use('/productos', productoRoutes);
router.use('/proveedores', proveedorRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/ventas', ventaRoutes);

module.exports = router;
