function errorHandler(err, req, res, next) {
  if (!err.status) {
    console.error(err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }

  const payload = { message: err.message };
  if (err.errors) {
    payload.errors = err.errors;
  }
  return res.status(err.status).json(payload);
}

module.exports = errorHandler;
