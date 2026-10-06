'use strict';

const COMPRAS_INICIALES = [
  {
    id: 1,
    proveedorId: 1,
    fecha: '2026-09-28',
    estado: 'COMPLETADA',
    createdAt: '2026-09-28T14:00:00.000Z',
    updatedAt: '2026-09-29T10:00:00.000Z',
    detalles: [
      { id: 1, productoId: 1, cantidad: 4, precioUnitario: 262000 },
      { id: 2, productoId: 5, cantidad: 10, precioUnitario: 58000 },
      { id: 3, productoId: 10, cantidad: 6, precioUnitario: 82000 },
    ],
  },
  {
    id: 2,
    proveedorId: 2,
    fecha: '2026-09-30',
    estado: 'COMPLETADA',
    createdAt: '2026-09-30T11:30:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
    detalles: [
      { id: 4, productoId: 16, cantidad: 8, precioUnitario: 66000 },
      { id: 5, productoId: 17, cantidad: 12, precioUnitario: 35000 },
    ],
  },
  {
    id: 3,
    proveedorId: 5,
    fecha: '2026-10-02',
    estado: 'PENDIENTE',
    createdAt: '2026-10-02T15:00:00.000Z',
    updatedAt: '2026-10-02T15:00:00.000Z',
    detalles: [
      { id: 6, productoId: 7, cantidad: 2, precioUnitario: 545000 },
      { id: 7, productoId: 13, cantidad: 3, precioUnitario: 152000 },
    ],
  },
  {
    id: 4,
    proveedorId: 4,
    fecha: '2026-10-03',
    estado: 'PENDIENTE',
    createdAt: '2026-10-03T10:15:00.000Z',
    updatedAt: '2026-10-03T10:15:00.000Z',
    detalles: [
      { id: 8, productoId: 20, cantidad: 3, precioUnitario: 598000 },
      { id: 9, productoId: 26, cantidad: 2, precioUnitario: 342000 },
      { id: 10, productoId: 33, cantidad: 5, precioUnitario: 76000 },
    ],
  },
  {
    id: 5,
    proveedorId: 8,
    fecha: '2026-10-04',
    estado: 'PENDIENTE',
    createdAt: '2026-10-04T12:00:00.000Z',
    updatedAt: '2026-10-04T12:00:00.000Z',
    detalles: [
      { id: 11, productoId: 35, cantidad: 4, precioUnitario: 138000 },
      { id: 12, productoId: 37, cantidad: 6, precioUnitario: 112000 },
    ],
  },
  {
    id: 6,
    proveedorId: 3,
    fecha: '2026-09-26',
    estado: 'CANCELADA',
    createdAt: '2026-09-26T09:00:00.000Z',
    updatedAt: '2026-09-27T16:00:00.000Z',
    detalles: [{ id: 13, productoId: 23, cantidad: 2, precioUnitario: 430000 }],
  },
  {
    id: 7,
    proveedorId: 6,
    fecha: '2026-10-05',
    estado: 'PENDIENTE',
    createdAt: '2026-10-05T09:45:00.000Z',
    updatedAt: '2026-10-05T09:45:00.000Z',
    detalles: [
      { id: 14, productoId: 29, cantidad: 5, precioUnitario: 69000 },
      { id: 15, productoId: 30, cantidad: 3, precioUnitario: 40000 },
      { id: 16, productoId: 31, cantidad: 20, precioUnitario: 10500 },
    ],
  },
  {
    id: 8,
    proveedorId: 1,
    fecha: '2026-10-06',
    estado: 'PENDIENTE',
    createdAt: '2026-10-06T08:30:00.000Z',
    updatedAt: '2026-10-06T08:30:00.000Z',
    detalles: [
      { id: 17, productoId: 12, cantidad: 5, precioUnitario: 93000 },
      { id: 18, productoId: 36, cantidad: 4, precioUnitario: 43000 },
    ],
  },
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'compras',
      COMPRAS_INICIALES.map(({ detalles, ...compra }) => ({
        ...compra,
        usuarioId: 1,
      })),
    );

    const detallesPlanos = COMPRAS_INICIALES.flatMap(({ id, detalles }) =>
      detalles.map((detalle) => ({ ...detalle, compraId: id })),
    );

    await queryInterface.bulkInsert('compra_detalles', detallesPlanos);

    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('compras', 'id'), (SELECT MAX(id) FROM compras))",
    );
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('compra_detalles', 'id'), (SELECT MAX(id) FROM compra_detalles))",
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('compra_detalles', {
      compraId: COMPRAS_INICIALES.map((compra) => compra.id),
    });
    await queryInterface.bulkDelete('compras', {
      id: COMPRAS_INICIALES.map((compra) => compra.id),
    });
  },
};
