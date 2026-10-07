const { DataTypes } = require('sequelize');

const sequelize = require('../sequelize');

const ArmadoComponente = sequelize.define('ArmadoComponente', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  armadoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'armados',
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
  tableName: 'armado_componentes',
  timestamps: false,
});

module.exports = ArmadoComponente;
