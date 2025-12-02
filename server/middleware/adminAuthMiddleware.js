const jwt = require('jsonwebtoken');
require('dotenv').config();

const adminAuthMiddleware = (req, res, next) => {
  // 1. Ambil token dari header
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ msg: 'Tidak ada token, otorisasi ditolak' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ msg: 'Format token salah, otorisasi ditolak' });
  }

  try {
    // 2. Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // { id: 1, role: 'admin' }

    // 3. (INI YANG PENTING) Cek jika rolenya adalah admin
    if (req.user.role !== 'admin'&& req.user.role !== 'timdis') {
        return res.status(403).json({ msg: 'Akses ditolak. Rute ini hanya untuk admin.' });
    }

    next(); // Lanjutkan ke controller jika lolos
  } catch (err) {
    res.status(401).json({ msg: 'Token tidak valid' });
  }
};

module.exports = adminAuthMiddleware;