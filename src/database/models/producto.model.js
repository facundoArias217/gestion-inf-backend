const { DataTypes } = require('sequelize');

const sequelize = require('../sequelize');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  marca: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  categoriaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categorias',
      key: 'id',
    },
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'productos',
  timestamps: true,
});

module.exports = Producto;
