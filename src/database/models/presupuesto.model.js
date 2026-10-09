const { DataTypes } = require('sequelize');

const sequelize = require('../sequelize');

const Presupuesto = sequelize.define('Presupuesto', {
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
  armadoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'armados',
      key: 'id',
    },
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  fechaVencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('PENDIENTE', 'ACEPTADO', 'RECHAZADO', 'CONVERTIDO'),
    allowNull: false,
    defaultValue: 'PENDIENTE',
  },
}, {
  tableName: 'presupuestos',
  timestamps: true,
});

module.exports = Presupuesto;
