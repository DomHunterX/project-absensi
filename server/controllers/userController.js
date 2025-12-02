const User = require('../models/User');
const faceapi = require('face-api.js');
const { loadImage } = require('canvas');
const path = require('path');
const StudyProgram = require('../models/StudyProgram'); // Import model
const Major = require('../models/Major');             // Import model
const fs = require('fs'); // Import untuk menghapus file
const bcrypt = require('bcryptjs');

// Mengambil data profil (DIPERBAIKI FINAL UNTUK RELASI)
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            // Hapus 'jabatan', hanya ambil atribut yang relevan
            attributes: ['id', 'nama', 'npm', 'email', 'foto_profil', 'studyProgramId', 'kelas'], 
            
            // Menambahkan Nested Include untuk Jurusan dan Prodi
            include: [{
                model: StudyProgram,
                attributes: ['name'],
                include: [{
                    model: Major,
                    attributes: ['name']
                }]
            }]
        });
        
        if (!user) {
            return res.status(404).json({ msg: 'User tidak ditemukan' });
        }
        
        res.json(user); 
    } catch (err) {
        console.error("Error getProfile:", err.message);
        res.status(500).send('Server Error');
    }
};

// Memperbarui data profil (DIPERBAIKI FINAL)
exports.updateProfile = async (req, res) => {
    const { nama, npm } = req.body; // Hanya terima nama dan npm
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User tidak ditemukan' });
        }
        user.nama = nama || user.nama;
        user.npm = npm || user.npm;
        // Kolom 'jabatan' sudah dihapus, tidak perlu diupdate
        
        await user.save();
        res.json({ msg: 'Profil berhasil diperbarui', user });
    } catch (err) {
        console.error("Error updateProfile:", err.message);
        if (err.name === 'SequelizeUniqueConstraintError') {
             return res.status(400).json({ msg: 'NPM sudah digunakan oleh akun lain.' });
        }
        res.status(500).send('Server Error');
    }
};

// Mengunggah foto profil DAN mendeteksi wajah (LOGIKA SAMA)
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Tidak ada file yang diunggah.' });
        }

        const imagePath = req.file.path;
        const image = await loadImage(imagePath);

        const detection = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();

        if (!detection) {
            // Jika tidak ada wajah terdeteksi, hapus file
            fs.unlinkSync(imagePath); 
            return res.status(400).json({ msg: 'Wajah tidak terdeteksi di foto. Harap gunakan foto yang lebih jelas.' });
        }

        const descriptor = detection.descriptor;
        const user = await User.findByPk(req.user.id);
        
        // Hapus foto lama jika ada
        if (user.foto_profil && fs.existsSync(user.foto_profil)) {
             fs.unlinkSync(user.foto_profil);
        }
        
        // Simpan path foto dan deskriptor wajah sebagai JSON string
        user.foto_profil = imagePath.replace(/\\/g, '/');
        user.face_descriptor = JSON.stringify(Object.values(descriptor)); 
        
        await user.save();

        res.json({ 
            msg: 'Foto profil berhasil diunggah dan data wajah berhasil disimpan.', 
            filePath: user.foto_profil 
        });

    } catch (err) {
        console.error("Error uploadProfilePicture:", err.message);
        res.status(500).send('Server Error');
    }
};

// FUNGSI BARU UNTUK ADMIN: Mengambil semua pengguna (DIPERBARUI)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            // Tambahkan studyProgramId
            attributes: ['id', 'nama', 'npm', 'email', 'role', 'createdAt', 'studyProgramId', 'kelas'],
            include: [{
                model: StudyProgram,
                attributes: ['name'],
                include: [{
                    model: Major,
                    attributes: ['name']
                }]
            }]
        });

        // Format data agar Prodi dan Jurusan mudah diakses di frontend
        const formattedUsers = users.map(user => ({
            id: user.id,
            nama: user.nama,
            npm: user.npm,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            studyProgramId: user.studyProgramId,
            kelas: user.kelas || 'Belum ada kelas',
            studyProgramName: user.StudyProgram ? user.StudyProgram.name : 'Belum Ditentukan',
            majorName: (user.StudyProgram && user.StudyProgram.Major) ? user.StudyProgram.Major.name : 'Belum Ditentukan'
        }));

        res.json(formattedUsers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// FUNGSI BARU UNTUK ADMIN: Menghapus user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: 'User tidak ditemukan' });
        }

        // Hapus foto profil fisik user jika ada
        if (user.foto_profil && fs.existsSync(user.foto_profil)) {
             fs.unlinkSync(user.foto_profil);
        }

        // Hapus user dari database (Sequelize akan menghapus absensi terkait secara kaskade jika diatur, 
        // atau kita biarkan absensi tetap ada sebagai log)
        await user.destroy();
        res.json({ msg: 'User berhasil dihapus' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// FUNGSI BARU UNTUK ADMIN: Update data user (DIPERBARUI)
exports.updateUserByAdmin = async (req, res) => {
    const { nama, npm, email, role, studyProgramId, kelas } = req.body; // Ambil studyProgramId
    
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User tidak ditemukan' });
        }

        user.nama = nama || user.nama;
        user.npm = npm || user.npm;
        user.email = email || user.email;
        user.role = role || user.role;

        if (kelas !== undefined) user.kelas = kelas;
        
        // Update Study Program ID
        if (studyProgramId !== undefined && studyProgramId !== '') {
             user.studyProgramId = studyProgramId;
        } else if (studyProgramId === '') {
             user.studyProgramId = null; // Memungkinkan admin menghapus penugasan
        }

        await user.save();
        res.json({ msg: 'Data user berhasil diperbarui', user });

    } catch (err) {
        console.error(err.message);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ msg: 'Email atau NPM sudah digunakan.' });
        }
        res.status(500).send('Server Error');
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validasi input sederhana
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ msg: 'Harap isi password saat ini dan password baru.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ msg: 'Password baru minimal 6 karakter.' });
    }

    try {
        // 1. Ambil user dari database (termasuk password hash)
        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({ msg: 'User tidak ditemukan.' });
        }

        // 2. Cek apakah password lama cocok
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Password saat ini salah.' });
        }

        // 3. Hash password baru
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // 4. Simpan
        await user.save();

        res.json({ msg: 'Password berhasil diubah.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createUserByAdmin = async (req, res) => {
    const { nama, npm, email, password, role, studyProgramId, kelas } = req.body;

    // 1. Validasi Input Dasar
    if (!nama || !npm || !email || !password || !role) {
        return res.status(400).json({ msg: 'Mohon lengkapi data wajib (Nama, NPM, Email, Password, Role).' });
    }

    try {
        // 2. Cek Duplikasi (Email & NPM)
        const existingUser = await User.findOne({ 
            where: { 
                [require('sequelize').Op.or]: [{ email }, { npm }] 
            } 
        });
        
        if (existingUser) {
            return res.status(400).json({ msg: 'Email atau NPM sudah terdaftar.' });
        }

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Simpan ke Database
        const newUser = await User.create({
            nama,
            npm,
            email,
            password: hashedPassword,
            role,
            kelas: kelas || null,
            studyProgramId: studyProgramId || null
        });

        res.status(201).json({ msg: 'User berhasil ditambahkan!', user: newUser });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};