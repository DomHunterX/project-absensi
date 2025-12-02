const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fungsi Registrasi Pengguna
exports.register = async (req, res) => {
    const { nama, npm, email, password } = req.body;

    // Validasi input dasar
    if (!nama || !npm || !email || !password) {
        return res.status(400).json({ msg: 'Harap isi semua field yang wajib.' });
    }

    try {
        // Cek apakah email sudah terdaftar
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ msg: 'Email sudah terdaftar.' });
        }

        // Cek apakah NPM sudah terdaftar
        user = await User.findOne({ where: { npm } });
        if (user) {
            return res.status(400).json({ msg: 'NPM sudah terdaftar.' });
        }

        // Buat instance user baru
        user = new User({
            nama,
            npm,
            email,
            password,
            // role akan otomatis 'user' karena nilai default di model
        });

        // Enkripsi password sebelum disimpan
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Simpan user ke database
        await user.save();

        res.status(201).json({ msg: 'Registrasi berhasil!' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Fungsi Login Pengguna
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Harap isi email dan password.' });
    }
    try {
        // Cari user berdasarkan email
        let user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ msg: 'Ussername atau Password Salah' });
        }

        // Bandingkan password yang diinput dengan yang ada di database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Ussername atau Password Salah   ' });
        }

        // Buat payload untuk token, pastikan 'role' disertakan
        const payload = {
            user: {
                id: user.id,
                role: user.role // <-- Bagian ini yang paling penting
            }
        };

        // Buat dan kirim token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                // Kirimkan token DAN data user yang relevan
                res.json({ 
                    token,
                    user: {
                        id: user.id,
                        role: user.role,
                        nama: user.nama
                    }
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};