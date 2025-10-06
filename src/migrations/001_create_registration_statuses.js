const { sequelize } = require('../models');

async function up() {
	await sequelize.getQueryInterface().createTable('registration_statuses', {
		registration_status_id: { type: 'BIGINT', primaryKey: true, allowNull: false },
		registration_id: { type: 'BIGINT', allowNull: false },
		status: { type: 'VARCHAR(100)', allowNull: false },
		date_created: { type: 'DATE', allowNull: false }
	});

	try {
		await sequelize.getQueryInterface().addConstraint('registration_statuses', {
			fields: ['registration_id'],
			type: 'foreign key',
			name: 'fk_registration_statuses_registration_id',
			references: {
				table: 'registrations',
				field: 'registration_id'
			},
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE'
		});
	} catch (error) {
		if (error.name !== 'SequelizeDatabaseError' || !error.message.includes('Duplicate foreign key constraint name')) {
			throw error;
		}
	}
}

async function down() {
	await sequelize.getQueryInterface().dropTable('registration_statuses');
}

module.exports = { up, down };


