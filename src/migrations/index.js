require('dotenv').config();
const { up: up001 } = require('./001_create_registration_statuses');
const { up: up002 } = require('./002_create_registrations');
const mysql = require('mysql2/promise');
const { sequelize } = require('../models');
const { runImport } = require('../scripts/importer');

async function ensureDatabase() {
	const {
		DB_HOST,
		DB_PORT,
		DB_USER,
		DB_PASS,
		DB_NAME
	} = process.env;

	const opts = {
		host: DB_HOST || '127.0.0.1',
		port: Number(DB_PORT || '3306'),
		user: DB_USER,
		password: DB_PASS
	};
	const connection = await mysql.createConnection(opts);
	const sql = `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
	await connection.query(sql);
	await connection.end();
}

async function migrate() {
	await ensureDatabase();
	await sequelize.authenticate();
	await up002();
	await up001();
	const { registrationCount, statusCount } = await runImport();
	// eslint-disable-next-line no-console
	console.log(`Migration completed. Imported ${registrationCount} registrations and ${statusCount} registration statuses.`);
}

module.exports = { migrate };


