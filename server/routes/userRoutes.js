const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { 
    getProfile, 
    updateProfile, 
    uploadProfilePicture, 
    getAllUsers, 
    deleteUser, // <-- BARU
    updateUserByAdmin, // <-- BARU
    changePassword,
    createUserByAdmin
} = require('../controllers/userController');

// Konfigurasi Multer untuk penyimpanan file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Simpan file di folder 'uploads'
    },
    filename: function (req, file, cb) {
        // Buat nama file yang unik untuk menghindari duplikat
        const uniqueSuffix   = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'user-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// GET /api/users/all - Rute untuk admin mengambil semua data user
router.get('/all', adminAuthMiddleware, getAllUsers);

// Rute untuk data profil (GET dan PUT)
router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, updateProfile);
router.post('/upload-profile', authMiddleware, upload.single('profilePicture'), uploadProfilePicture);

router.put('/change-password', authMiddleware, changePassword);

// @route   DELETE api/users/:id
// @desc    Menghapus user oleh admin
// @access  Admin
router.delete('/:id', adminAuthMiddleware, deleteUser);

// @route   PUT api/users/:id
// @desc    Memperbarui data user oleh admin
// @access  Admin
router.put('/:id', adminAuthMiddleware, updateUserByAdmin);

router.post('/add', adminAuthMiddleware, createUserByAdmin);

module.exports = router;