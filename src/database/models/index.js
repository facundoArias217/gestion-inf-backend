const sequelize = require('../sequelize');

const Categoria = require('./categoria.model');
const Usuario = require('./usuario.model');

module.exports = { sequelize, Categoria, Usuario };
