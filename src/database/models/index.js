const sequelize = require('../sequelize');

const Categoria = require('./categoria.model');
const Cliente = require('./cliente.model');
const Compra = require('./compra.model');
const CompraDetalle = require('./compraDetalle.model');
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

module.exports = {
  sequelize,
  Categoria,
  Cliente,
  Compra,
  CompraDetalle,
  Producto,
  Proveedor,
  Usuario,
  Venta,
  VentaDetalle,
};
