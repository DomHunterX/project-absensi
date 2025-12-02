// project-absensi/seeders/initialData.js

const Major = require('../models/Major');
const StudyProgram = require('../models/StudyProgram');
const User = require('../models/User'); // Jika ingin membuat admin default
const bcrypt = require('bcryptjs'); // <<< BARIS BARU: Impor bcryptjs

// Fungsi untuk menjalankan seeder
exports.runSeeders = async () => {
    try {
        console.log('--- Memulai Seeding Data Awal (Jurusan & Prodi) ---');

        // 1. Tambahkan Jurusan & Koordinat (Contoh Koordinat Kampus)
        const majorEB = await Major.findOrCreate({
            where: { name: 'Jurusan Ekonomi dan Bisnis' },
            defaults: {
                name: 'Jurusan Ekonomi dan Bisnis',
                // Contoh Koordinat 1 (Lokasi Gedung 1)
                latitude: -5.377000, 
                longitude: 105.253000,
                radius: 100 // Radius toleransi 100 meter
            }
        });
        
        const majorTI = await Major.findOrCreate({
            where: { name: 'Jurusan Teknologi Informasi' },
            defaults: {
                name: 'Jurusan Teknologi Informasi',
                // Contoh Koordinat 2 (Lokasi Gedung 2)
                latitude: -5.376500, 
                longitude: 105.254000,
                radius: 100 // Radius toleransi 100 meter
            }
        });

        const majorEBId = majorEB[0].id;
        const majorTIId = majorTI[0].id;

        // 2. Tambahkan Program Studi
        await StudyProgram.findOrCreate({
            where: { name: 'Akuntansi Perpajakan' },
            defaults: { name: 'Akuntansi Perpajakan', majorId: majorEBId }
        });

        await StudyProgram.findOrCreate({
            where: { name: 'Teknologi Rekayasa Perangkat Lunak' },
            defaults: { name: 'Teknologi Rekayasa Perangkat Lunak', majorId: majorTIId }
        });
        
        // 3. Tambahkan Akun Admin Default (Opsional)
        // Catatan: Jika Anda sudah punya user admin, ini bisa di skip
        const adminEmail = 'admin@polinela.ac.id';
const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt); 
        
        const [adminUser, created] = await User.findOrCreate({
            where: { email: adminEmail },
            defaults: {
                nama: 'Super Admin',
                npm: '999999999',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
            }
        });
        
        if (created) {
            console.log(`Akun Admin default dibuat: ${adminEmail} / admin123`);
        } else {
            console.log(`Akun Admin sudah ada.`);
        }

        console.log('--- Seeding Data Awal Selesai ---');

    } catch (error) {
        console.error('ERROR saat Seeding:', error);
    }
};