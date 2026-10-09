'use strict';

const PRESUPUESTOS_INICIALES = [
  {
    id: 1,
    clienteId: 3,
    armadoId: 1,
    fecha: '2026-10-08',
    fechaVencimiento: '2026-10-12',
    estado: 'PENDIENTE',
    createdAt: '2026-10-08T15:00:00.000Z',
    updatedAt: '2026-10-08T15:00:00.000Z',
    detalles: [],
  },
  {
    id: 2,
    clienteId: 5,
    armadoId: 3,
    fecha: '2026-10-07',
    fechaVencimiento: '2026-10-14',
    estado: 'ACEPTADO',
    createdAt: '2026-10-07T12:00:00.000Z',
    updatedAt: '2026-10-09T10:00:00.000Z',
    detalles: [],
  },
  {
    id: 3,
    clienteId: 1,
    armadoId: 2,
    fecha: '2026-10-08',
    fechaVencimiento: '2026-10-22',
    estado: 'PENDIENTE',
    createdAt: '2026-10-08T16:00:00.000Z',
    updatedAt: '2026-10-08T16:00:00.000Z',
    detalles: [
      { id: 1, productoId: 17, cantidad: 1, precioUnitario: 42000 },
      { id: 2, productoId: 31, cantidad: 2, precioUnitario: 12000 },
    ],
  },
  {
    id: 4,
    clienteId: 2,
    armadoId: null,
    fecha: '2026-09-30',
    fechaVencimiento: '2026-10-03',
    estado: 'PENDIENTE',
    createdAt: '2026-09-30T11:00:00.000Z',
    updatedAt: '2026-09-30T11:00:00.000Z',
    detalles: [
      { id: 3, productoId: 16, cantidad: 1, precioUnitario: 78000 },
      { id: 4, productoId: 37, cantidad: 1, precioUnitario: 125000 },
    ],
  },
  {
    id: 5,
    clienteId: 6,
    armadoId: null,
    fecha: '2026-09-25',
    fechaVencimiento: '2026-10-01',
    estado: 'ACEPTADO',
    createdAt: '2026-09-25T14:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
    detalles: [
      { id: 5, productoId: 26, cantidad: 1, precioUnitario: 385000 },
    ],
  },
  {
    id: 6,
    clienteId: 7,
    armadoId: null,
    fecha: '2026-09-22',
    fechaVencimiento: '2026-09-29',
    estado: 'RECHAZADO',
    createdAt: '2026-09-22T10:00:00.000Z',
    updatedAt: '2026-09-28T16:00:00.000Z',
    detalles: [
      { id: 6, productoId: 35, cantidad: 1, precioUnitario: 155000 },
    ],
  },
  {
    id: 7,
    clienteId: 4,
    armadoId: 2,
    fecha: '2026-09-20',
    fechaVencimiento: '2026-09-27',
    estado: 'CONVERTIDO',
    createdAt: '2026-09-20T09:00:00.000Z',
    updatedAt: '2026-09-27T12:00:00.000Z',
    detalles: [],
  },
  {
    id: 8,
    clienteId: 8,
    armadoId: null,
    fecha: '2026-10-09',
    fechaVencimiento: '2026-10-11',
    estado: 'PENDIENTE',
    createdAt: '2026-10-09T10:30:00.000Z',
    updatedAt: '2026-10-09T10:30:00.000Z',
    detalles: [
      { id: 7, productoId: 23, cantidad: 1, precioUnitario: 480000 },
      { id: 8, productoId: 32, cantidad: 1, precioUnitario: 26000 },
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

    if (detallesPlanos.length > 0) {
      await queryInterface.bulkInsert('presupuesto_detalles', detallesPlanos);
    }

    await queryInterface.bulkUpdate(
      'ventas',
      { presupuestoId: 7 },
      { id: 7 },
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
      { presupuestoId: 7 },
    );

    await queryInterface.bulkDelete('presupuesto_detalles', {
      presupuestoId: PRESUPUESTOS_INICIALES.map((presupuesto) => presupuesto.id),
    });
    await queryInterface.bulkDelete('presupuestos', {
      id: PRESUPUESTOS_INICIALES.map((presupuesto) => presupuesto.id),
    });
  },
};
