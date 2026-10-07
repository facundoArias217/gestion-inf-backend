'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('armados', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id',
        },
      },
      clienteId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'clientes',
          key: 'id',
        },
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
      },
      estado: {
        type: Sequelize.ENUM('BORRADOR', 'FINALIZADO'),
        allowNull: false,
        defaultValue: 'BORRADOR',
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

    await queryInterface.createTable('armado_componentes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      armadoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'armados',
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
    await queryInterface.dropTable('armado_componentes');
    await queryInterface.dropTable('armados');
  },
};
