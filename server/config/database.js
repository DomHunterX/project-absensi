const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
);

// Uji koneksi
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Koneksi database berhasil.');
  } catch (error) {
    console.error('Tidak dapat terhubung ke database:', error);
  }
}

testConnection();

module.exports = sequelize;