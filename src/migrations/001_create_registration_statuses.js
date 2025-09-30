const { sequelize } = require('../models');

async function up() {
  await sequelize.getQueryInterface().createTable('registration_statuses', {
    registration_status_id: { type: 'BIGINT', primaryKey: true, allowNull: false },
    registration_id: { type: 'BIGINT', allowNull: false },
    status: { type: 'VARCHAR(100)', allowNull: false },
    date_created: { type: 'DATE', allowNull: false }
  });
}

async function down() {
  await sequelize.getQueryInterface().dropTable('registration_statuses');
}

module.exports = { up, down };


