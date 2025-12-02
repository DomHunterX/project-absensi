const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  // Ambil token dari header 'Authorization'
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ msg: 'Tidak ada token, otorisasi ditolak' });
  }

  // Format token adalah "Bearer <token>"
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'Format token salah, otorisasi ditolak' });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Tambahkan info user dari token ke object request
    req.user = decoded.user;
    next(); // Lanjutkan ke controller
  } catch (err) {
    res.status(401).json({ msg: 'Token tidak valid' });
  }
};

module.exports = authMiddleware;