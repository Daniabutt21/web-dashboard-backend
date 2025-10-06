const { sequelize } = require('../models');

async function up() {
	await sequelize.getQueryInterface().createTable('registrations', {
		registration_id: { type: 'BIGINT', primaryKey: true, allowNull: false, unique: true },
		vin: { type: 'VARCHAR(255)', allowNull: false, unique: true },
		client_id: { type: 'INTEGER', allowNull: false },
		is_completed: { type: 'BOOLEAN', allowNull: false, defaultValue: false }
	});
}

async function down() {
	await sequelize.getQueryInterface().dropTable('registrations');
}

module.exports = { up, down };
