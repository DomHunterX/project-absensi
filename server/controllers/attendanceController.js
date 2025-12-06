const faceapi = require('face-api.js');
const User = require('../models/User');
const { Canvas, Image, ImageData, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs'); // Penting untuk hapus file
const Attendance = require('../models/Attendance');
const StudyProgram = require('../models/StudyProgram'); 
const Major = require('../models/Major');            
const { Op } = require('sequelize'); 

const FACE_DISTANCE_THRESHOLD = 0.6; 
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Memuat model AI saat server pertama kali dijalankan
Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromDisk(path.join(__dirname, '../models_faceapi')),
    faceapi.nets.faceLandmark68Net.loadFromDisk(path.join(__dirname, '../models_faceapi')),
    faceapi.nets.faceRecognitionNet.loadFromDisk(path.join(__dirname, '../models_faceapi'))
]).then(() => console.log('Model FaceAPI berhasil dimuat di server.'));


// Fungsi Haversine untuk menghitung jarak (tidak berubah)
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius bumi dalam meter
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

// Logika absensi utama (FINAL)
exports.markAttendance = async (req, res) => {
    const userId = req.user.id;
    let uploadedFilePath = null;

    try {
        // Cek apakah ada file foto bukti
        if (req.file) {
            uploadedFilePath = req.file.path.replace(/\\/g, '/');
        } else {
            return res.status(400).json({ msg: 'Gagal. Bukti foto wajah wajib disertakan.' });
        }

        // KARENA PAKAI FORMDATA, DATA JSON ADA DI req.body.data SEBAGAI STRING
        // Kita harus parse manual
        const { descriptor: liveDescriptor, location } = JSON.parse(req.body.data);

        // --- MULAI VALIDASI (SAMA SEPERTI SEBELUMNYA) ---
        const user = await User.findByPk(userId, {
            attributes: ['id', 'face_descriptor'],
            include: [{
                model: StudyProgram,
                attributes: ['id', 'name'],
                include: [{
                    model: Major,
                    attributes: ['latitude', 'longitude', 'radius', 'name']
                }]
            }]
        });

        if (!user || !user.StudyProgram || !user.StudyProgram.Major || !user.face_descriptor) {
            // HAPUS FILE JIKA GAGAL VALIDASI DATA
            if (uploadedFilePath) fs.unlinkSync(uploadedFilePath);
            return res.status(400).json({ msg: 'Data user/jurusan/wajah tidak lengkap.' });
        }

        // Validasi Lokasi
        const userLat = parseFloat(location.latitude);
        const userLng = parseFloat(location.longitude);
        const majorLocation = user.StudyProgram.Major;
        const distanceGeo = getDistance(userLat, userLng, majorLocation.latitude, majorLocation.longitude);

        if (distanceGeo > majorLocation.radius) {
            if (uploadedFilePath) fs.unlinkSync(uploadedFilePath);
            return res.status(400).json({ msg: `Lokasi kejauhan (${Math.round(distanceGeo)}m). Max: ${majorLocation.radius}m.` });
        }

        // Validasi Wajah AI
        const storedDescriptor = new Float32Array(JSON.parse(user.face_descriptor));
        const liveDescriptorArray = new Float32Array(liveDescriptor); 
        const distanceFace = faceapi.euclideanDistance(storedDescriptor, liveDescriptorArray);

        if (distanceFace > FACE_DISTANCE_THRESHOLD) {
            if (uploadedFilePath) fs.unlinkSync(uploadedFilePath);
            return res.status(400).json({ msg: `Wajah tidak cocok. Jarak: ${distanceFace.toFixed(3)}` });
        }

        // Validasi 24 Jam (Opsional, saat ini dimatikan sesuai request sebelumnya)
        // ...

        // --- SIMPAN KE DATABASE ---
        await Attendance.create({
            userId: user.id,
            date: new Date(),
            status: 'Menunggu Validasi', // <--- STATUS PENDING
            latitude: userLat, 
            longitude: userLng,
            bukti_foto: uploadedFilePath // <--- SIMPAN PATH FOTO
        });

        res.json({ 
            success: true, 
            message: `Absensi terkirim! Status: Menunggu Validasi Timdis. Bukti foto telah diunggah.` 
        });

    } catch (err) {
        // Hapus file jika terjadi error server
        if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
            fs.unlinkSync(uploadedFilePath);
        }
        console.error("Error markAttendance:", err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

exports.validateAttendance = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'Hadir' atau 'Ditolak'

    try {
        const attendance = await Attendance.findByPk(id);
        if (!attendance) {
            return res.status(404).json({ msg: 'Data absensi tidak ditemukan.' });
        }

        // Update Status
        attendance.status = status;
        
        // LOGIKA HEMAT PENYIMPANAN:
        // Jika status valid ('Hadir'), hapus foto buktinya karena sudah tidak dibutuhkan
        if (status === 'Hadir' && attendance.bukti_foto) {
            const filePath = path.join(__dirname, '..', attendance.bukti_foto);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                attendance.bukti_foto = null; // Kosongkan path di DB
            }
        }
        // Jika 'Ditolak', foto tetap disimpan sebagai barang bukti (atau bisa dihapus juga kalau mau)

        await attendance.save();

        res.json({ msg: `Absensi berhasil divalidasi menjadi: ${status}` });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};


// FUNGSI UNTUK ADMIN: Mengambil semua absensi (tidak berubah)
exports.getAllAttendance = async (req, res) => {
    try {
        // 1. Ambil parameter filter dari Query URL
        const { programId, kelas, startDate, endDate } = req.query;

        // 2. Siapkan kondisi filter untuk USER (Prodi & Kelas)
        let userWhereClause = {};
        if (programId) {
            userWhereClause.studyProgramId = programId;
        }
        if (kelas) {
            userWhereClause.kelas = kelas;
        }

        // 3. Siapkan kondisi filter untuk ABSENSI (Tanggal - Opsional)
        let attendanceWhereClause = {};
        if (startDate && endDate) {
            // Filter rentang tanggal jika ada
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            attendanceWhereClause.date = {
                [Op.between]: [start, end]
            };
        }

        // 4. Query Database
        const allAttendance = await Attendance.findAll({
            where: attendanceWhereClause, // Filter tanggal masuk sini
            order: [['date', 'DESC']],
            include: {
                model: User,
                attributes: ['nama', 'npm', 'email', 'kelas', 'foto_profil'], // Pastikan 'kelas' diambil
                where: userWhereClause, // Filter Prodi & Kelas masuk sini
                include: {
                    model: StudyProgram, // Include Prodi untuk ditampilkan namanya
                    attributes: ['name']
                }
            }
        });

        res.json(allAttendance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// FUNGSI UNTUK USER: Mengambil riwayat absensi (tidak berubah)
exports.getAttendanceHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const history = await Attendance.findAll({
            where: { userId: userId },
            order: [['date', 'DESC']]
        });

        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteAttendance = async (req, res) => {
    const { id } = req.params;
    try {
        const attendance = await Attendance.findByPk(id);
        if (!attendance) {
            return res.status(404).json({ msg: 'Data absensi tidak ditemukan.' });
        }

        // Hapus file foto jika ada
        if (attendance.bukti_foto) {
            const filePath = path.join(__dirname, '..', attendance.bukti_foto);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await attendance.destroy();
        res.json({ msg: 'Data absensi berhasil dihapus.' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};