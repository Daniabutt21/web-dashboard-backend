const { Sequelize, DataTypes } = require('sequelize');
const { getConfig } = require('../config');

const config = getConfig();
const sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
	host: config.db.host,
	port: config.db.port,
	dialect: config.db.dialect,
	logging: config.db.logging
});

const Registration = sequelize.define('Registration', {
	registrationId: { type: DataTypes.BIGINT, primaryKey: true },
	vin: { type: DataTypes.STRING(255), allowNull: false },
	clientId: { type: DataTypes.INTEGER, allowNull: false },
	isCompleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, {
	tableName: 'registrations',
	timestamps: false,
	underscored: true
});

const RegistrationStatus = sequelize.define('RegistrationStatus', {
	registrationStatusId: { type: DataTypes.BIGINT, primaryKey: true },
	registrationId: { type: DataTypes.BIGINT, allowNull: false },
	status: { type: DataTypes.STRING(100), allowNull: false },
	dateCreated: { type: DataTypes.DATEONLY, allowNull: false }
}, {
	tableName: 'registration_statuses',
	timestamps: false,
	underscored: true
});

module.exports = { sequelize, Registration, RegistrationStatus };


