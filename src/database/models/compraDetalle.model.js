const { DataTypes } = require('sequelize');

const sequelize = require('../sequelize');

const CompraDetalle = sequelize.define('CompraDetalle', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  compraId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'compras',
      key: 'id',
    },
  },
  productoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'productos',
      key: 'id',
    },
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'compra_detalles',
  timestamps: false,
});

module.exports = CompraDetalle;
