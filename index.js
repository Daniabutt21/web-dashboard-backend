// Express server entrypoint: config, API routes, and static frontend serving
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
require('dotenv').config();

const { getConfig } = require('./src/config');
const registerRoutes = require('./src/routes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// API routes
registerRoutes(app);

// Serve AngularJS client
const clientDir = path.join(__dirname, '../web-dashboard');
app.use(express.static(clientDir));
app.get('*', (req, res) => {
	res.sendFile(path.join(clientDir, 'index.html'));
});

const config = getConfig();
const port = config.port;

app.listen(port, () => {
	console.log(`Server listening on http://localhost:${port}`);
});
