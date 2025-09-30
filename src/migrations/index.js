const { up: up001 } = require('./001_create_registration_statuses');
const mysql = require('mysql2/promise');
const { getConfig } = require('../config');
const { sequelize } = require('../models');
const { runImport } = require('../scripts/importer');

async function ensureDatabase() {
  const cfg = getConfig().db;
  const connection = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.username,
    password: cfg.password
  });
  const sql = `CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
  await connection.query(sql);
  await connection.end();
}

async function migrate() {
  await ensureDatabase();
  await sequelize.authenticate();
  await up001();
  const total = await runImport();
  // eslint-disable-next-line no-console
  console.log(`Imported ${total} CSV rows.`);
}

module.exports = { migrate };


