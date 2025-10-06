const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const { sequelize, Registration, RegistrationStatus } = require('../models');

async function ensureDataCsv() {
	const rootStatusCsv = path.join(__dirname, '../../registration_status_data.csv');
	const rootRegistrationCsv = path.join(__dirname, '../../regsitration_data.csv');
	const dataDir = path.join(__dirname, '../../data');
	const targetStatusCsv = path.join(dataDir, 'registration_status_data.csv');
	const targetRegistrationCsv = path.join(dataDir, 'regsitration_data.csv');
	
	if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
	
	if (fs.existsSync(rootStatusCsv) && !fs.existsSync(targetStatusCsv)) {
		fs.copyFileSync(rootStatusCsv, targetStatusCsv);
	}
	if (fs.existsSync(rootRegistrationCsv) && !fs.existsSync(targetRegistrationCsv)) {
		fs.copyFileSync(rootRegistrationCsv, targetRegistrationCsv);
	}
	
	return { targetStatusCsv, targetRegistrationCsv };
}

async function importRegistrations(csvPath) {
	const parser = fs
		.createReadStream(csvPath)
		.pipe(parse({ columns: true, trim: true }));

	const rows = [];
	for await (const record of parser) {
		const row = {
			registrationId: Number(record.REGISTRATION_ID),
			vin: String(record.VIN).trim(),
			clientId: Number(record.CLIENT_ID),
			isCompleted: record.IS_COMPLETED === '1' || record.IS_COMPLETED === 'true'
		};
		rows.push(row);
	}

	const chunkSize = 1000;
	for (let i = 0; i < rows.length; i += chunkSize) {
		const batch = rows.slice(i, i + chunkSize);
		await Registration.bulkCreate(batch, { ignoreDuplicates: true });
	}

	return rows.length;
}

async function importRegistrationStatuses(csvPath) {
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

async function runImport() {
	await sequelize.authenticate();
	const { targetStatusCsv, targetRegistrationCsv } = await ensureDataCsv();

	console.log('Importing registrations...');
	const registrationCount = await importRegistrations(targetRegistrationCsv);
	console.log(`Imported ${registrationCount} registration records.`);

	console.log('Importing registration statuses...');
	const statusCount = await importRegistrationStatuses(targetStatusCsv);
	console.log(`Imported ${statusCount} registration status records.`);

	return { registrationCount, statusCount };
}

module.exports = { runImport };


