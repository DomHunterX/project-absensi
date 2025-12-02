const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('dotenv').config();
const path = require('path');
const { runSeeders } = require('./seeders/initialData'); // <<< BARU
const dashboardRoutes = require('./routes/dashboardRoutes'); // Import

// PASTIKAN SEMUA MODEL DI-IMPORT DI SINI AGAR TERDAFTAR DI SEQUELIZE
require('./models/User'); 
require('./models/Attendance');
require('./models/Major');        // <<< BARU
require('./models/StudyProgram'); // <<< BARU

const app = express();

// Middleware
const corsOptions = {
  origin: ['http://localhost:3000'] // Sesuaikan dengan IP Anda
};
app.use(cors(corsOptions));
app.use(express.json());

// ▼▼▼ BAGIAN PALING PENTING PENYEBAB ERROR ▼▼▼
// Baris ini memberitahu server untuk membuat folder 'uploads' bisa diakses secara publik
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/models', express.static(path.join(__dirname, 'models_faceapi')));

// Sajikan halaman admin dari folder public/admin
app.use('/admin', express.static(path.join(__dirname, 'public')));

app.use('/api/dashboard', dashboardRoutes); // Pasang Route

// Sinkronisasi Database
sequelize.sync({ alter: false }).then(async () => {
  console.log('Database tersinkronisasi.');
  runSeeders();
});

// Routes
app.get('/', (req, res) => {
  res.send('API Server untuk Absensi Wajah & QR Code');
});

// --- TAMBAHKAN ROUTE TES DI SINI ---
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server Terhubung!' });
});

// Panggil routes autentikasi
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Panggil routes user
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Panggil routes absensi
const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api/attendance', attendanceRoutes);

// Panggil routes jurusan (BARU)
const majorRoutes = require('./routes/majorRoutes');
app.use('/api/majors', majorRoutes); // <<< BARIS BARU

const PORT = process.env.APP_PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan di port ${PORT} dan siap menerima koneksi dari luar`);
});

