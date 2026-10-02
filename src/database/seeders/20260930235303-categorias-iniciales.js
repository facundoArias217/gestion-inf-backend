'use strict';

const CATEGORIAS_INICIALES = [
  {
    nombre: 'Procesador',
    descripcion: 'CPUs de escritorio para armados de PC',
    activo: true,
  },
  {
    nombre: 'Motherboard',
    descripcion: 'Placas madre para distintas plataformas',
    activo: true,
  },
  {
    nombre: 'Memoria RAM',
    descripcion: 'Módulos de memoria DDR4 y DDR5',
    activo: true,
  },
  {
    nombre: 'Placa de video',
    descripcion: 'GPUs dedicadas para gaming y trabajo',
    activo: true,
  },
  {
    nombre: 'Almacenamiento',
    descripcion: 'Discos SSD, HDD y NVMe',
    activo: true,
  },
  {
    nombre: 'Fuente',
    descripcion: 'Fuentes de alimentación ATX',
    activo: true,
  },
  {
    nombre: 'Gabinete',
    descripcion: 'Gabinetes ATX, mATX y ITX',
    activo: true,
  },
  {
    nombre: 'Periféricos',
    descripcion: 'Teclados, mouses, monitores y accesorios',
    activo: true,
  },
  {
    nombre: 'Refrigeración',
    descripcion: 'Coolers de aire y watercooling',
    activo: false,
  },
  {
    nombre: 'Optimización',
    descripcion: 'Categoría de prueba con baja lógica',
    activo: false,
  },
];

module.exports = {
  async up(queryInterface) {
    const fecha = new Date();

    await queryInterface.bulkInsert(
      'categorias',
      CATEGORIAS_INICIALES.map((categoria) => ({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        activo: categoria.activo,
        createdAt: fecha,
        updatedAt: fecha,
      })),
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categorias', {
      nombre: CATEGORIAS_INICIALES.map((categoria) => categoria.nombre),
    });
  },
};
