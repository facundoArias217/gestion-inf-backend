'use strict';

const CATEGORIAS_ADICIONALES = [
  {
    nombre: 'Notebooks',
    descripcion: 'Notebooks y laptops de escritorio y gaming',
  },
  {
    nombre: 'Monitores',
    descripcion: 'Monitores y pantallas para PC y consolas',
  },
  {
    nombre: 'Impresoras',
    descripcion: 'Impresoras de tinta, láser y multifunción',
  },
  {
    nombre: 'Redes y conectividad',
    descripcion: 'Routers, switches, access points y placas de red',
  },
  {
    nombre: 'Cables y adaptadores',
    descripcion: 'Cables, adaptadores y extenders de video y datos',
  },
  {
    nombre: 'Software',
    descripcion: 'Licencias de sistemas operativos, oficina y antivirus',
  },
  {
    nombre: 'UPS y energía',
    descripcion: 'UPS, estabilizadores y protectores de tensión',
  },
  {
    nombre: 'Audio',
    descripcion: 'Auriculares, parlantes y micrófonos',
  },
];

module.exports = {
  async up(queryInterface) {
    const fecha = new Date();

    await queryInterface.bulkInsert(
      'categorias',
      CATEGORIAS_ADICIONALES.map((categoria) => ({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        activo: true,
        createdAt: fecha,
        updatedAt: fecha,
      })),
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categorias', {
      nombre: CATEGORIAS_ADICIONALES.map((categoria) => categoria.nombre),
    });
  },
};
