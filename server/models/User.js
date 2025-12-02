// project-absensi/models/User.js (UPDATED)

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const StudyProgram = require('./StudyProgram'); // Import model baru

const User = sequelize.define('User', {
    // Nama, NPM, Kelas
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    npm: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    kelas: {
        type: DataTypes.STRING,
        allowNull: true, // Boleh kosong jika dosen/admin
    },
    
    // GANTI: Kolom 'jabatan' diganti dengan 'studyProgramId' (Foreign Key)
    studyProgramId: { 
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: StudyProgram,
            key: 'id'
        }
    },
    
    foto_profil: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // ROLE ADMIN
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user', // 'user' atau 'admin'
        allowNull: false,
    },
    
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    face_descriptor: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
    }
});

// Relasi: Satu User memiliki satu Program Studi
User.belongsTo(StudyProgram, { foreignKey: 'studyProgramId' });
StudyProgram.hasMany(User, { foreignKey: 'studyProgramId' });

module.exports = User;