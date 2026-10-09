const dashboardService = require('../services/dashboard.service');

async function obtener(req, res, next) {
  try {
    const data = await dashboardService.obtener();
    return res.status(200).json({ message: 'Dashboard obtenido', data });
  } catch (error) {
    return next(error);
  }
}

module.exports = { obtener };
