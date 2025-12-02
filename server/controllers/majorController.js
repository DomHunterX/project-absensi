// project-absensi/controllers/majorController.js (FINAL CRUD)

const Major = require('../models/Major');
const StudyProgram = require('../models/StudyProgram');
const User = require('../models/User'); // Diperlukan untuk validasi delete Prodi

// @desc    Admin: Menambahkan Jurusan baru (CREATE)
// @route   POST /api/majors/major
exports.addMajor = async (req, res) => {
    const { name, latitude, longitude, radius } = req.body;

    if (!name || !latitude || !longitude || !radius) {
        return res.status(400).json({ msg: 'Semua field wajib diisi: nama, latitude, longitude, dan radius.' });
    }

    try {
        const major = await Major.create({ 
            name, 
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radius: parseInt(radius)
        });
        res.status(201).json({ msg: 'Jurusan berhasil ditambahkan.', major });
    } catch (err) {
        console.error(err.message);
        if (err.name === 'SequelizeUniqueConstraintError') {
             return res.status(400).json({ msg: 'Nama jurusan sudah ada.' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Admin: Memperbarui Jurusan dan Lokasi (UPDATE)
// @route   PUT /api/majors/major/:id
exports.updateMajor = async (req, res) => {
    const { name, latitude, longitude, radius } = req.body;
    const { id } = req.params;

    if (!latitude || !longitude || !radius) {
        return res.status(400).json({ msg: 'Latitude, longitude, dan radius wajib diisi.' });
    }

    try {
        const major = await Major.findByPk(id);
        if (!major) {
            return res.status(404).json({ msg: 'Jurusan tidak ditemukan.' });
        }
        
        // HANYA UPDATE LOKASI DAN RADIUS (Nama tidak diizinkan diubah via frontend saat ini)
        major.latitude = parseFloat(latitude);
        major.longitude = parseFloat(longitude);
        major.radius = parseInt(radius);
        
        // Opsional: Jika nama disertakan dalam payload, perbarui juga (hati-hati dengan uniqueness)
        if (name) {
             major.name = name;
        }

        await major.save();
        res.json({ msg: 'Jurusan berhasil diperbarui.', major });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Admin: Menghapus Jurusan (DELETE)
// @route   DELETE /api/majors/major/:id
exports.deleteMajor = async (req, res) => {
    const { id } = req.params;
    try {
        const major = await Major.findByPk(id, {
            include: [StudyProgram]
        });
        if (!major) {
            return res.status(404).json({ msg: 'Jurusan tidak ditemukan.' });
        }
        
        // Cek apakah ada Program Studi yang masih terikat
        if (major.StudyPrograms && major.StudyPrograms.length > 0) {
            // Hapus Program Studi terlebih dahulu
            for (const program of major.StudyPrograms) {
                // Cek apakah ada user yang terikat pada Prodi ini
                 const usersCount = await User.count({ where: { studyProgramId: program.id } });
                 if (usersCount > 0) {
                     return res.status(400).json({ msg: `Gagal menghapus Jurusan. Program Studi '${program.name}' masih memiliki ${usersCount} pengguna yang terikat.` });
                 }
                 await program.destroy();
            }
        }
        
        await major.destroy();
        res.json({ msg: 'Jurusan berhasil dihapus.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// --------------------------------------------------------
// Program Studi (StudyProgram) Controllers
// --------------------------------------------------------

// @desc    Admin: Menambahkan Program Studi baru (CREATE)
// @route   POST /api/majors/program
exports.addStudyProgram = async (req, res) => {
    const { name, majorId } = req.body;

    if (!name || !majorId) {
        return res.status(400).json({ msg: 'Nama Program Studi dan ID Jurusan wajib diisi.' });
    }

    try {
        const program = await StudyProgram.create({ name, majorId });
        res.status(201).json({ msg: 'Program Studi berhasil ditambahkan.', program });
    } catch (err) {
        console.error(err.message);
        if (err.name === 'SequelizeUniqueConstraintError') {
             return res.status(400).json({ msg: 'Nama program studi sudah ada.' });
        }
        // Foreign Key Error jika majorId tidak ada
        if (err.name === 'SequelizeForeignKeyConstraintError') {
             return res.status(400).json({ msg: 'ID Jurusan tidak valid.' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Admin: Menghapus Program Studi (DELETE)
// @route   DELETE /api/majors/program/:id
exports.deleteStudyProgram = async (req, res) => {
    const { id } = req.params;
    try {
        const program = await StudyProgram.findByPk(id);
        if (!program) {
            return res.status(404).json({ msg: 'Program Studi tidak ditemukan.' });
        }

        // Cek apakah ada User yang masih terikat dengan Program Studi ini
        const usersCount = await User.count({ where: { studyProgramId: id } });
        if (usersCount > 0) {
            return res.status(400).json({ msg: `Gagal menghapus. Masih ada ${usersCount} pengguna yang terikat dengan Program Studi ini.` });
        }

        await program.destroy();
        res.json({ msg: 'Program Studi berhasil dihapus.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @desc    Admin/Umum: Mengambil semua Jurusan dan Program Studi (READ)
// @route   GET /api/majors/all
exports.getAllMajorsAndPrograms = async (req, res) => {
    try {
        const majors = await Major.findAll({
            include: [{
                model: StudyProgram,
                attributes: ['id', 'name']
            }],
            attributes: ['id', 'name', 'latitude', 'longitude', 'radius']
        });
        res.json(majors);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};