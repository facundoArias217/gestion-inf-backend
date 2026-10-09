'use strict';

const PAGOS_INICIALES = [
  {
    id: 1,
    ventaId: 1,
    medioPago: 'EFECTIVO',
    monto: 506000,
    resultado: 'APROBADO',
    fecha: '2026-10-05',
    createdAt: '2026-10-05T14:30:00.000Z',
    updatedAt: '2026-10-05T14:30:00.000Z',
  },
  {
    id: 2,
    ventaId: 2,
    medioPago: 'TARJETA',
    monto: 203000,
    resultado: 'RECHAZADO',
    fecha: '2026-10-06',
    createdAt: '2026-10-06T17:00:00.000Z',
    updatedAt: '2026-10-06T17:00:00.000Z',
  },
  {
    id: 3,
    ventaId: 2,
    medioPago: 'TRANSFERENCIA',
    monto: 203000,
    resultado: 'APROBADO',
    fecha: '2026-10-07',
    createdAt: '2026-10-07T10:15:00.000Z',
    updatedAt: '2026-10-07T10:15:00.000Z',
  },
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('pagos', PAGOS_INICIALES);

    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('pagos', 'id'), (SELECT MAX(id) FROM pagos))",
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('pagos', {
      id: PAGOS_INICIALES.map((pago) => pago.id),
    });
  },
};
