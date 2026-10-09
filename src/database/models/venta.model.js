const { DataTypes } = require('sequelize');

const sequelize = require('../sequelize');

const Venta = sequelize.define('Venta', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clientes',
      key: 'id',
    },
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id',
    },
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('COMPLETADA', 'CANCELADA'),
    allowNull: false,
    defaultValue: 'COMPLETADA',
  },
  presupuestoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'presupuestos',
      key: 'id',
    },
  },
}, {
  tableName: 'ventas',
  timestamps: true,
});

module.exports = Venta;
