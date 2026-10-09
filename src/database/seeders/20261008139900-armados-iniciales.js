'use strict';

const ARMADOS_INICIALES = [
  {
    id: 1,
    nombre: 'PC Gamer Pro',
    descripcion: 'Build gaming de gama alta con RTX 4060',
    clienteId: null,
    estado: 'FINALIZADO',
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T15:00:00.000Z',
    componentes: [
      { id: 1, productoId: 1, cantidad: 1, precioUnitario: 305000 },
      { id: 2, productoId: 3, cantidad: 1, precioUnitario: 210000 },
      { id: 3, productoId: 6, cantidad: 2, precioUnitario: 145000 },
      { id: 4, productoId: 7, cantidad: 1, precioUnitario: 620000 },
      { id: 5, productoId: 10, cantidad: 1, precioUnitario: 95000 },
      { id: 6, productoId: 13, cantidad: 1, precioUnitario: 165000 },
      { id: 7, productoId: 14, cantidad: 1, precioUnitario: 82000 },
    ],
  },
  {
    id: 2,
    nombre: 'PC Oficina Básica',
    descripcion: 'Equipo económico con gráficos integrados',
    clienteId: null,
    estado: 'FINALIZADO',
    createdAt: '2026-09-24T11:00:00.000Z',
    updatedAt: '2026-09-24T16:00:00.000Z',
    componentes: [
      { id: 8, productoId: 2, cantidad: 1, precioUnitario: 285000 },
      { id: 9, productoId: 4, cantidad: 1, precioUnitario: 185000 },
      { id: 10, productoId: 5, cantidad: 2, precioUnitario: 68000 },
      { id: 11, productoId: 10, cantidad: 1, precioUnitario: 95000 },
      { id: 12, productoId: 12, cantidad: 1, precioUnitario: 105000 },
      { id: 13, productoId: 15, cantidad: 1, precioUnitario: 56000 },
    ],
  },
  {
    id: 3,
    nombre: 'PC Workstation de Diseño',
    descripcion: 'Para trabajo de diseño y edición de video',
    clienteId: null,
    estado: 'FINALIZADO',
    createdAt: '2026-09-28T12:00:00.000Z',
    updatedAt: '2026-09-28T18:00:00.000Z',
    componentes: [
      { id: 14, productoId: 1, cantidad: 1, precioUnitario: 305000 },
      { id: 15, productoId: 4, cantidad: 1, precioUnitario: 185000 },
      { id: 16, productoId: 6, cantidad: 2, precioUnitario: 145000 },
      { id: 17, productoId: 7, cantidad: 1, precioUnitario: 620000 },
      { id: 18, productoId: 11, cantidad: 1, precioUnitario: 78000 },
      { id: 19, productoId: 13, cantidad: 1, precioUnitario: 165000 },
      { id: 20, productoId: 14, cantidad: 1, precioUnitario: 82000 },
    ],
  },
  {
    id: 4,
    nombre: 'Configuración pendiente',
    descripcion: 'Completa, lista para finalizar',
    clienteId: null,
    estado: 'BORRADOR',
    createdAt: '2026-10-05T09:00:00.000Z',
    updatedAt: '2026-10-05T09:00:00.000Z',
    componentes: [
      { id: 21, productoId: 2, cantidad: 1, precioUnitario: 285000 },
      { id: 22, productoId: 3, cantidad: 1, precioUnitario: 210000 },
      { id: 23, productoId: 5, cantidad: 1, precioUnitario: 68000 },
      { id: 24, productoId: 10, cantidad: 1, precioUnitario: 95000 },
      { id: 25, productoId: 12, cantidad: 1, precioUnitario: 105000 },
      { id: 26, productoId: 15, cantidad: 1, precioUnitario: 56000 },
    ],
  },
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'armados',
      ARMADOS_INICIALES.map(({ componentes, ...armado }) => ({
        ...armado,
        usuarioId: 2,
      })),
    );

    const componentesPlanos = ARMADOS_INICIALES.flatMap(({ id, componentes }) =>
      componentes.map((componente) => ({ ...componente, armadoId: id })),
    );

    await queryInterface.bulkInsert('armado_componentes', componentesPlanos);

    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('armados', 'id'), (SELECT MAX(id) FROM armados))",
    );
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('armado_componentes', 'id'), (SELECT MAX(id) FROM armado_componentes))",
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('armado_componentes', {
      armadoId: ARMADOS_INICIALES.map((armado) => armado.id),
    });
    await queryInterface.bulkDelete('armados', {
      id: ARMADOS_INICIALES.map((armado) => armado.id),
    });
  },
};
