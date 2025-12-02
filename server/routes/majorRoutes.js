// project-absensi/routes/majorRoutes.js (FINAL ROUTES)

const express = require('express');
const router = express.Router();
const { 
    addMajor, 
    updateMajor, 
    deleteMajor, 
    addStudyProgram, 
    deleteStudyProgram, 
    getAllMajorsAndPrograms 
} = require('../controllers/majorController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// --------------------------------------------------------
// Jurusan (Major) Routes - Membutuhkan Autentikasi Admin
// --------------------------------------------------------

// CREATE
router.post('/major', adminAuthMiddleware, addMajor);

// UPDATE Lokasi dan Radius Jurusan
router.put('/major/:id', adminAuthMiddleware, updateMajor);      

// DELETE Jurusan (Memeriksa keterikatan Program Studi dan User)
router.delete('/major/:id', adminAuthMiddleware, deleteMajor);   


// --------------------------------------------------------
// Program Studi (StudyProgram) Routes - Membutuhkan Autentikasi Admin
// --------------------------------------------------------

// CREATE
router.post('/program', adminAuthMiddleware, addStudyProgram);

// DELETE Program Studi (Memeriksa keterikatan User)
router.delete('/program/:id', adminAuthMiddleware, deleteStudyProgram); 


// --------------------------------------------------------
// Get All (READ) - Dapat diakses publik atau oleh user untuk mengisi form
// --------------------------------------------------------

router.get('/all', getAllMajorsAndPrograms);

module.exports = router;