// project-absensi/models/StudyProgram.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Major = require('./Major');

const StudyProgram = sequelize.define('StudyProgram', {
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
    majorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Major,
            key: 'id'
        }
    }
});

// Relasi: Satu Jurusan memiliki banyak Program Studi
Major.hasMany(StudyProgram, { foreignKey: 'majorId' });
StudyProgram.belongsTo(Major, { foreignKey: 'majorId' });

module.exports = StudyProgram;