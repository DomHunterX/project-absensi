// project-absensi/routes/attendanceRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
    markAttendance, 
    getAttendanceHistory, 
    getAllAttendance,
    validateAttendance // <--- Import fungsi baru
} = require('../controllers/attendanceController'); 

const authMiddleware = require('../middleware/authMiddleware');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// --- KONFIGURASI MULTER (UPLOAD BUKTI) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Pastikan folder ini sudah dibuat: uploads/attendance_proofs
        cb(null, 'uploads/attendance_proofs/'); 
    },
    filename: function (req, file, cb) {
        // Format: proof-USERID-TIMESTAMP.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'proof-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// --- ROUTES ---

// 1. Absensi User (Sekarang pakai Upload)
// 'image' adalah key yang akan dikirim dari FormData di frontend
router.post('/mark', authMiddleware, upload.single('image'), markAttendance);

// 2. History User
router.get('/history', authMiddleware, getAttendanceHistory);

// 3. Admin/Timdis: Lihat Semua
router.get('/all', adminAuthMiddleware, getAllAttendance);

// 4. Admin/Timdis: Validasi Absensi (BARU)
router.put('/validate/:id', adminAuthMiddleware, validateAttendance);

module.exports = router;