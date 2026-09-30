const cors = require('cors');
const express = require('express');

const errorHandler = require('./middlewares/error.middleware');
const env = require('./config/env');
const routes = require('./routes');

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(routes);
app.use(errorHandler);

module.exports = app;
