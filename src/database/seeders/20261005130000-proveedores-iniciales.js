'use strict';

const PROVEEDORES_INICIALES = [
  { id: 1, razonSocial: 'Maxiconsumo SA', cuit: '30567890127', email: 'ventas@maxiconsumo.com.ar', telefono: '11 4488-9900', direccion: 'Gral. Paz 13250, José C. Paz', activo: true, createdAt: '2026-08-02T10:00:00.000Z', updatedAt: '2026-08-02T10:00:00.000Z' },
  { id: 2, razonSocial: 'MayoristaTech SRL', cuit: '30712090347', email: 'pedidos@mayoristatech.com', telefono: '11 5566-1212', direccion: 'Av. Córdoba 4560, CABA', activo: true, createdAt: '2026-08-02T10:10:00.000Z', updatedAt: '2026-08-02T10:10:00.000Z' },
  { id: 3, razonSocial: 'PuntoByte SRL', cuit: '27594038172', email: 'ventas@puntobyte.com.ar', telefono: '11 4855-6699', direccion: 'Av. Mitre 2100, Avellaneda', activo: false, createdAt: '2026-07-05T09:00:00.000Z', updatedAt: '2026-09-25T15:00:00.000Z' },
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('proveedores', PROVEEDORES_INICIALES);

    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('proveedores', 'id'), (SELECT MAX(id) FROM proveedores))",
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('proveedores', {
      id: PROVEEDORES_INICIALES.map((proveedor) => proveedor.id),
    });
  },
};
