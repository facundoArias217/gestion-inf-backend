'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ventas', 'presupuestoId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'presupuestos',
        key: 'id',
      },
    });

    await queryInterface.addConstraint('ventas', {
      fields: ['presupuestoId'],
      type: 'unique',
      name: 'ventas_presupuestoId_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('ventas', 'ventas_presupuestoId_unique');
    await queryInterface.removeColumn('ventas', 'presupuestoId');
  },
};
