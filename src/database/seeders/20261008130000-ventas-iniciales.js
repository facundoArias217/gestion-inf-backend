'use strict';

const VENTAS_INICIALES = [
  {
    id: 1,
    clienteId: 1,
    fecha: '2026-10-05',
    estado: 'COMPLETADA',
    createdAt: '2026-10-05T14:00:00.000Z',
    updatedAt: '2026-10-05T14:00:00.000Z',
    detalles: [
      { id: 1, productoId: 23, cantidad: 1, precioUnitario: 480000 },
      { id: 2, productoId: 32, cantidad: 1, precioUnitario: 26000 },
    ],
  },
  {
    id: 2,
    clienteId: 2,
    fecha: '2026-10-06',
    estado: 'COMPLETADA',
    createdAt: '2026-10-06T16:30:00.000Z',
    updatedAt: '2026-10-06T16:30:00.000Z',
    detalles: [
      { id: 3, productoId: 16, cantidad: 1, precioUnitario: 78000 },
      { id: 4, productoId: 37, cantidad: 1, precioUnitario: 125000 },
    ],
  },
  {
    id: 3,
    clienteId: 3,
    fecha: '2026-10-03',
    estado: 'CANCELADA',
    createdAt: '2026-10-03T12:00:00.000Z',
    updatedAt: '2026-10-07T10:00:00.000Z',
    detalles: [
      { id: 5, productoId: 26, cantidad: 1, precioUnitario: 385000 },
    ],
  },
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'ventas',
      VENTAS_INICIALES.map(({ detalles, ...venta }) => ({
        ...venta,
        usuarioId: 2,
      })),
    );

    const detallesPlanos = VENTAS_INICIALES.flatMap(({ id, detalles }) =>
      detalles.map((detalle) => ({ ...detalle, ventaId: id })),
    );

    await queryInterface.bulkInsert('venta_detalles', detallesPlanos);

    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('ventas', 'id'), (SELECT MAX(id) FROM ventas))",
    );
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('venta_detalles', 'id'), (SELECT MAX(id) FROM venta_detalles))",
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('venta_detalles', {
      ventaId: VENTAS_INICIALES.map((venta) => venta.id),
    });
    await queryInterface.bulkDelete('ventas', {
      id: VENTAS_INICIALES.map((venta) => venta.id),
    });
  },
};
