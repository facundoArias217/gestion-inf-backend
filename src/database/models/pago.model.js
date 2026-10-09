const { DataTypes } = require('sequelize');

const sequelize = require('../sequelize');

const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ventaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ventas',
      key: 'id',
    },
  },
  medioPago: {
    type: DataTypes.ENUM('EFECTIVO', 'TRANSFERENCIA', 'TARJETA'),
    allowNull: false,
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  resultado: {
    type: DataTypes.ENUM('APROBADO', 'RECHAZADO'),
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  tableName: 'pagos',
  timestamps: true,
});

module.exports = Pago;
