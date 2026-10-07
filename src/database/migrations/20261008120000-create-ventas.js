'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ventas', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      clienteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clientes',
          key: 'id',
        },
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id',
        },
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      estado: {
        type: Sequelize.ENUM('COMPLETADA', 'CANCELADA'),
        allowNull: false,
        defaultValue: 'COMPLETADA',
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

    await queryInterface.createTable('venta_detalles', {
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
      productoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'productos',
          key: 'id',
        },
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      precioUnitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('venta_detalles');
    await queryInterface.dropTable('ventas');
  },
};
