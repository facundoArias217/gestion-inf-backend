const CAMPOS_PUBLICOS = ['id', 'nombre', 'descripcion', 'clienteId', 'estado', 'createdAt', 'updatedAt'];

function serializarComponente(componente) {
  const plano = componente.toJSON ? componente.toJSON() : componente;
  return {
    id: plano.id,
    productoId: plano.productoId,
    cantidad: plano.cantidad,
    precioUnitario: Number(plano.precioUnitario),
  };
}

function serializarArmado(armado) {
  const plano = armado.toJSON ? armado.toJSON() : armado;
  const dto = CAMPOS_PUBLICOS.reduce((resultado, campo) => {
    resultado[campo] = plano[campo];
    return resultado;
  }, {});
  dto.componentes = (plano.componentes ?? []).map(serializarComponente);
  return dto;
}

function serializarArmados(armados) {
  return armados.map(serializarArmado);
}

module.exports = { serializarArmado, serializarArmados, CAMPOS_PUBLICOS };
