const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const { sequelize, RegistrationStatus } = require('../models');

async function ensureDataCsv() {
  const rootCsv = path.join(__dirname, '../../tables.csv');
  const dataDir = path.join(__dirname, '../../data');
  const targetCsv = path.join(dataDir, 'tables.csv');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  if (fs.existsSync(rootCsv) && !fs.existsSync(targetCsv)) {
    fs.copyFileSync(rootCsv, targetCsv);
  }
  return targetCsv;
}

async function runImport() {
  await sequelize.authenticate();
  const csvPath = await ensureDataCsv();

  const parser = fs
    .createReadStream(csvPath)
    .pipe(parse({ columns: true, trim: true }));

  const rows = [];
  for await (const record of parser) {
    const row = {
      registrationStatusId: Number(record.REGISTRATION_STATUS_ID),
      registrationId: Number(record.REGISTRATION_ID),
      status: String(record.STATUS).replace(/\s+/g, ' ').trim(),
      dateCreated: new Date(record.DATE_CREATED)
    };
    rows.push(row);
  }

  const chunkSize = 1000;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const batch = rows.slice(i, i + chunkSize);
    await RegistrationStatus.bulkCreate(batch, { ignoreDuplicates: true });
  }

  return rows.length;
}

module.exports = { runImport };


