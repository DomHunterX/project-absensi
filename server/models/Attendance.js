// project-absensi/models/Attendance.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); 

const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATE, 
        allowNull: false
    },
    status: {
        type: DataTypes.STRING, 
        allowNull: false,
        defaultValue: 'Menunggu Validasi' // <--- UBAH DEFAULT VALUE
    },
    latitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    longitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    // ▼▼▼ TAMBAHKAN KOLOM INI ▼▼▼
    bukti_foto: {
        type: DataTypes.STRING,
        allowNull: true, // Menyimpan path file gambar
    }
});

User.hasMany(Attendance, { foreignKey: 'userId' });
Attendance.belongsTo(User, { foreignKey: 'userId' });

module.exports = Attendance;