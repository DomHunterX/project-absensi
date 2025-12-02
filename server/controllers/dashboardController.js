// project-absensi/controllers/dashboardController.js

const { Op, Sequelize } = require('sequelize');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Major = require('../models/Major');

exports.getDashboardStats = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // 1. DATA UMUM (Parallel Query)
        const [
            totalUsers,
            totalMajors,
            attendanceToday,
            pendingValidation,
            recentLogs
        ] = await Promise.all([
            User.count({ where: { role: 'user' } }),
            Major.count(),
            Attendance.count({
                where: { date: { [Op.between]: [todayStart, todayEnd] } }
            }),
            Attendance.count({
                where: { status: 'Menunggu Validasi' }
            }),
            Attendance.findAll({
                limit: 5,
                order: [['date', 'DESC']],
                include: [{ model: User, attributes: ['nama', 'kelas'] }]
            })
        ]);

        // 2. DATA GRAFIK (7 HARI TERAKHIR)
        const labels = []; // Array nama hari (Senin, Selasa...)
        const dataHadir = []; // Array jumlah hadir

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            
            // Format Label Hari (Indo)
            const dayName = d.toLocaleDateString('id-ID', { weekday: 'long' });
            labels.push(dayName);

            // Set Range Waktu Hari Itu (00:00 - 23:59)
            const startDay = new Date(d); startDay.setHours(0,0,0,0);
            const endDay = new Date(d); endDay.setHours(23,59,59,999);

            // Hitung yang statusnya 'Hadir' pada hari itu
            const count = await Attendance.count({
                where: {
                    date: { [Op.between]: [startDay, endDay] },
                    status: 'Hadir' 
                }
            });
            dataHadir.push({ name: dayName, hadir: count });
        }

        res.json({
            totalUsers,
            totalMajors,
            attendanceToday,
            pendingValidation,
            recentLogs,
            graphData: dataHadir // <--- Kirim data grafik ke frontend
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error loading stats' });
    }
};