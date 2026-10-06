const { DataTypes } = require('sequelize');

const sequelize = require('../sequelize');

const Compra = sequelize.define('Compra', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  proveedorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'proveedores',
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
    type: DataTypes.ENUM('PENDIENTE', 'COMPLETADA', 'CANCELADA'),
    allowNull: false,
    defaultValue: 'PENDIENTE',
  },
}, {
  tableName: 'compras',
  timestamps: true,
});

module.exports = Compra;
