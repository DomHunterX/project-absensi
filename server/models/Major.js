// project-absensi/models/Major.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Major = sequelize.define('Major', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    // Lokasi Absensi Default Jurusan
    latitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0
    },
    longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0
    },
    radius: {
        type: DataTypes.INTEGER, // Radius toleransi dalam meter
        allowNull: false,
        defaultValue: 5000 // Default 50 meter
    }
});

module.exports = Major;