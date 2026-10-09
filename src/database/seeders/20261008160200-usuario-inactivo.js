'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const registros = await Promise.all([
      {
        nombre: 'Sofía',
        apellido: 'Torres',
        email: 'vendedor2@tienda.com',
        passwordHash: await bcrypt.hash('vendedor123', 10),
        rol: 'VENDEDOR',
        activo: false,
        createdAt: new Date('2026-09-15T10:00:00.000Z'),
        updatedAt: new Date('2026-09-29T18:00:00.000Z'),
      },
    ]);

    await queryInterface.bulkInsert('usuarios', registros);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('usuarios', {
      email: ['vendedor2@tienda.com'],
    });
  },
};
