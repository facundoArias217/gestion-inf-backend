'use strict';

const bcrypt = require('bcrypt');

const USUARIOS_INICIALES = [
  {
    nombre: 'Facundo',
    apellido: 'Arias',
    email: 'admin@tienda.com',
    password: 'admin123',
    rol: 'ADMIN',
  },
  {
    nombre: 'María',
    apellido: 'Gómez',
    email: 'vendedor@tienda.com',
    password: 'vendedor123',
    rol: 'VENDEDOR',
  },
];

module.exports = {
  async up(queryInterface) {
    const registros = await Promise.all(
      USUARIOS_INICIALES.map(async (usuario) => ({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        passwordHash: await bcrypt.hash(usuario.password, 10),
        rol: usuario.rol,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );

    await queryInterface.bulkInsert('usuarios', registros);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('usuarios', {
      email: USUARIOS_INICIALES.map((usuario) => usuario.email),
    });
  },
};
