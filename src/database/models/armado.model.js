const { DataTypes } = require('sequelize');

const sequelize = require('../sequelize');

const Armado = sequelize.define('Armado', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id',
    },
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clientes',
      key: 'id',
    },
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  estado: {
    type: DataTypes.ENUM('BORRADOR', 'FINALIZADO'),
    allowNull: false,
    defaultValue: 'BORRADOR',
  },
}, {
  tableName: 'armados',
  timestamps: true,
});

module.exports = Armado;
