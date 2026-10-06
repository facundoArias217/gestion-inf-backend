const sequelize = require('../sequelize');

const Categoria = require('./categoria.model');
const Cliente = require('./cliente.model');
const Producto = require('./producto.model');
const Proveedor = require('./proveedor.model');
const Usuario = require('./usuario.model');

Categoria.hasMany(Producto, { foreignKey: 'categoriaId', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoria' });

module.exports = { sequelize, Categoria, Cliente, Producto, Proveedor, Usuario };
