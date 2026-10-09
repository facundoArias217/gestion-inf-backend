const { Op } = require('sequelize');

const {
  Compra,
  Presupuesto,
  Producto,
  Venta,
  VentaDetalle,
} = require('../database/models');

const LIMITE_STOCK_BAJO = 5;
const COMPRAS_RECIENTES = 5;

function montoDeVentas(ventas) {
  return ventas.reduce(
    (acum, venta) =>
      acum +
      venta.detalles.reduce(
        (subtotal, detalle) =>
          subtotal + Number(detalle.cantidad) * Number(detalle.precioUnitario),
        0,
      ),
    0,
  );
}

async function obtener() {
  const hoy = new Date().toISOString().slice(0, 10);
  const inicioMes = `${hoy.slice(0, 7)}-01`;

  const productosBajoStock = await Producto.findAll({
    where: { activo: true, stock: { [Op.lte]: LIMITE_STOCK_BAJO } },
    order: [
      ['stock', 'ASC'],
      ['nombre', 'ASC'],
    ],
    limit: 5,
  });
  const productosBajoStockTotal = await Producto.count({
    where: { activo: true, stock: { [Op.lte]: LIMITE_STOCK_BAJO } },
  });

  const ventasHoy = await Venta.findAll({
    where: { estado: 'COMPLETADA', fecha: hoy },
    include: [{ model: VentaDetalle, as: 'detalles' }],
  });

  const ventasMes = await Venta.findAll({
    where: {
      estado: 'COMPLETADA',
      fecha: { [Op.between]: [inicioMes, hoy] },
    },
    include: [{ model: VentaDetalle, as: 'detalles' }],
  });

  const presupuestosPendientes = await Presupuesto.count({
    where: { estado: 'PENDIENTE' },
  });

  const comprasRecientes = await Compra.findAll({
    order: [
      ['fecha', 'DESC'],
      ['id', 'DESC'],
    ],
    limit: COMPRAS_RECIENTES,
  });

  return {
    productosBajoStock: {
      total: productosBajoStockTotal,
      items: productosBajoStock.map((producto) => ({
        id: producto.id,
        nombre: producto.nombre,
        stock: producto.stock,
      })),
    },
    ventasHoy: {
      cantidad: ventasHoy.length,
      montoTotal: montoDeVentas(ventasHoy),
    },
    ventasMes: {
      cantidad: ventasMes.length,
      montoTotal: montoDeVentas(ventasMes),
    },
    presupuestosPendientes: {
      cantidad: presupuestosPendientes,
    },
    comprasRecientes: comprasRecientes.map((compra) => ({
      id: compra.id,
      proveedorId: compra.proveedorId,
      fecha: compra.fecha,
      estado: compra.estado,
    })),
  };
}

module.exports = { obtener, LIMITE_STOCK_BAJO };
