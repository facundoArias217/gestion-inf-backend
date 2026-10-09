'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pagos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ventaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ventas',
          key: 'id',
        },
      },
      medioPago: {
        type: Sequelize.ENUM('EFECTIVO', 'TRANSFERENCIA', 'TARJETA'),
        allowNull: false,
      },
      monto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      resultado: {
        type: Sequelize.ENUM('APROBADO', 'RECHAZADO'),
        allowNull: false,
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pagos');
  },
};
