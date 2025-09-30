const path = require('path');

function getEnv(name, defaultValue) {
  return process.env[name] || defaultValue;
}

function getConfig() {
  const environment = getEnv('NODE_ENV', 'development');
  return {
    environment,
    port: Number(getEnv('PORT', '3000')),
    data: {
      csvDirectory: path.join(__dirname, '../../data')
    },
    db: {
      dialect: 'mysql',
      host: getEnv('DB_HOST'),
      port: Number(getEnv('DB_PORT')),
      database: getEnv('DB_NAME'),
      username: getEnv('DB_USER'),
      password: getEnv('DB_PASS'),
      logging: false
    }
  };
}

module.exports = { getConfig };


