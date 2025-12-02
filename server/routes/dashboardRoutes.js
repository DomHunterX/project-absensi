// project-absensi/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Bisa diakses Admin & Timdis
router.get('/stats', adminAuthMiddleware, getDashboardStats);

module.exports = router;