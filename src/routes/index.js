// Registers Express routes under /api and wires controllers
const express = require('express');
const metricsController = require('../controllers/metrics.controller');

module.exports = function registerRoutes(app) {
	const api = express.Router();

	api.get('/metrics/daily', metricsController.getDailyMetrics);


	app.use('/api', api);
};


