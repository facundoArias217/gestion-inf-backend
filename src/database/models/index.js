const sequelize = require('../sequelize');

const Armado = require('./armado.model');
const ArmadoComponente = require('./armadoComponente.model');
const Categoria = require('./categoria.model');
const Cliente = require('./cliente.model');
const Compra = require('./compra.model');
const CompraDetalle = require('./compraDetalle.model');
const Pago = require('./pago.model');
const Presupuesto = require('./presupuesto.model');
const PresupuestoDetalle = require('./presupuestoDetalle.model');
const Producto = require('./producto.model');
const Proveedor = require('./proveedor.model');
const Usuario = require('./usuario.model');
const Venta = require('./venta.model');
const VentaDetalle = require('./ventaDetalle.model');

Categoria.hasMany(Producto, { foreignKey: 'categoriaId', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoria' });

Compra.belongsTo(Proveedor, { foreignKey: 'proveedorId', as: 'proveedor' });
Compra.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
Compra.hasMany(CompraDetalle, { foreignKey: 'compraId', as: 'detalles' });
CompraDetalle.belongsTo(Compra, { foreignKey: 'compraId', as: 'compra' });
CompraDetalle.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

Venta.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });
Venta.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
Venta.hasMany(VentaDetalle, { foreignKey: 'ventaId', as: 'detalles' });
VentaDetalle.belongsTo(Venta, { foreignKey: 'ventaId', as: 'venta' });
VentaDetalle.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

Armado.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
Armado.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });
Armado.hasMany(ArmadoComponente, { foreignKey: 'armadoId', as: 'componentes' });
ArmadoComponente.belongsTo(Armado, { foreignKey: 'armadoId', as: 'armado' });
ArmadoComponente.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

Presupuesto.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });
Presupuesto.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
Presupuesto.belongsTo(Armado, { foreignKey: 'armadoId', as: 'armado' });
Presupuesto.hasMany(PresupuestoDetalle, { foreignKey: 'presupuestoId', as: 'detalles' });
Presupuesto.hasOne(Venta, { foreignKey: 'presupuestoId', as: 'venta' });
PresupuestoDetalle.belongsTo(Presupuesto, { foreignKey: 'presupuestoId', as: 'presupuesto' });
PresupuestoDetalle.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

Venta.belongsTo(Presupuesto, { foreignKey: 'presupuestoId', as: 'presupuesto' });
Venta.hasMany(Pago, { foreignKey: 'ventaId', as: 'pagos' });
Pago.belongsTo(Venta, { foreignKey: 'ventaId', as: 'venta' });

module.exports = {
  sequelize,
  Armado,
  ArmadoComponente,
  Categoria,
  Cliente,
  Compra,
  CompraDetalle,
  Pago,
  Presupuesto,
  PresupuestoDetalle,
  Producto,
  Proveedor,
  Usuario,
  Venta,
  VentaDetalle,
};
