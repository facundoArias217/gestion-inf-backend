'use strict';

const COMPRAS_INICIALES = [
  {
    id: 1,
    proveedorId: 1,
    fecha: '2026-10-02',
    estado: 'COMPLETADA',
    createdAt: '2026-10-02T14:00:00.000Z',
    updatedAt: '2026-10-02T18:00:00.000Z',
    detalles: [
      { id: 1, productoId: 5, cantidad: 2, precioUnitario: 68000 },
      { id: 2, productoId: 31, cantidad: 10, precioUnitario: 12000 },
    ],
  },
  {
    id: 2,
    proveedorId: 2,
    fecha: '2026-10-06',
    estado: 'PENDIENTE',
    createdAt: '2026-10-06T11:30:00.000Z',
    updatedAt: '2026-10-06T11:30:00.000Z',
    detalles: [
      { id: 3, productoId: 1, cantidad: 2, precioUnitario: 305000 },
    ],
  },
  {
    id: 3,
    proveedorId: 3,
    fecha: '2026-10-04',
    estado: 'CANCELADA',
    createdAt: '2026-10-04T15:00:00.000Z',
    updatedAt: '2026-10-05T09:00:00.000Z',
    detalles: [
      { id: 4, productoId: 8, cantidad: 1, precioUnitario: 598000 },
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
