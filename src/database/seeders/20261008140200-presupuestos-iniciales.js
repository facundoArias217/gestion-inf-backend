'use strict';

const PRESUPUESTOS_INICIALES = [
  {
    id: 1,
    clienteId: 1,
    armadoId: 1,
    fecha: '2026-10-08',
    fechaVencimiento: '2026-12-31',
    estado: 'PENDIENTE',
    createdAt: '2026-10-08T15:00:00.000Z',
    updatedAt: '2026-10-08T15:00:00.000Z',
    detalles: [
      { id: 1, productoId: 17, cantidad: 1, precioUnitario: 42000 },
    ],
  },
  {
    id: 2,
    clienteId: 2,
    armadoId: null,
    fecha: '2026-10-06',
    fechaVencimiento: '2026-12-31',
    estado: 'ACEPTADO',
    createdAt: '2026-10-06T12:00:00.000Z',
    updatedAt: '2026-10-08T10:00:00.000Z',
    detalles: [
      { id: 2, productoId: 5, cantidad: 1, precioUnitario: 68000 },
      { id: 3, productoId: 10, cantidad: 1, precioUnitario: 95000 },
    ],
  },
  {
    id: 3,
    clienteId: 1,
    armadoId: null,
    fecha: '2026-09-25',
    fechaVencimiento: '2026-09-29',
    estado: 'PENDIENTE',
    createdAt: '2026-09-25T14:00:00.000Z',
    updatedAt: '2026-09-25T14:00:00.000Z',
    detalles: [
      { id: 4, productoId: 16, cantidad: 1, precioUnitario: 78000 },
    ],
  },
  {
    id: 4,
    clienteId: 3,
    armadoId: null,
    fecha: '2026-09-28',
    fechaVencimiento: '2026-10-05',
    estado: 'CONVERTIDO',
    createdAt: '2026-09-28T09:00:00.000Z',
    updatedAt: '2026-10-03T12:00:00.000Z',
    detalles: [
      { id: 5, productoId: 26, cantidad: 1, precioUnitario: 385000 },
    ],
  },
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'presupuestos',
      PRESUPUESTOS_INICIALES.map(({ detalles, ...presupuesto }) => ({
        ...presupuesto,
        usuarioId: 2,
      })),
    );

    const detallesPlanos = PRESUPUESTOS_INICIALES.flatMap(({ id, detalles }) =>
      detalles.map((detalle) => ({ ...detalle, presupuestoId: id })),
    );

    await queryInterface.bulkInsert('presupuesto_detalles', detallesPlanos);

    await queryInterface.bulkUpdate(
      'ventas',
      { presupuestoId: 4 },
      { id: 3 },
    );

    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('presupuestos', 'id'), (SELECT MAX(id) FROM presupuestos))",
    );
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('presupuesto_detalles', 'id'), (SELECT MAX(id) FROM presupuesto_detalles))",
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkUpdate(
      'ventas',
      { presupuestoId: null },
      { presupuestoId: 4 },
    );

    await queryInterface.bulkDelete('presupuesto_detalles', {
      presupuestoId: PRESUPUESTOS_INICIALES.map((presupuesto) => presupuesto.id),
    });
    await queryInterface.bulkDelete('presupuestos', {
      id: PRESUPUESTOS_INICIALES.map((presupuesto) => presupuesto.id),
    });
  },
};
