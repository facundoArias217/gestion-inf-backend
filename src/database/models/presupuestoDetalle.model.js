const { DataTypes } = require('sequelize');

const sequelize = require('../sequelize');

const PresupuestoDetalle = sequelize.define('PresupuestoDetalle', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  presupuestoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'presupuestos',
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
  tableName: 'presupuesto_detalles',
  timestamps: false,
});

module.exports = PresupuestoDetalle;
