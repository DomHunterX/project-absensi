const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Atau SMTP hosting lain
    auth: {
        user: process.env.EMAIL_USER, // Masukkan di .env
        pass: process.env.EMAIL_PASS  // Password App Gmail (Bukan password login biasa)
    }
});

const sendNotificationEmail = async (toEmail, subject, text) => {
    try {
        await transporter.sendMail({
            from: '"Sistem Absensi Polinela" <no-reply@polinela.ac.id>',
            to: toEmail,
            subject: subject,
            html: `<div style="font-family: Arial;">
                    <h2>Notifikasi Absensi</h2>
                    <p>${text}</p>
                    <br/>
                    <small>Ini adalah email otomatis, jangan dibalas.</small>
                    </div>`
        });
        console.log('Email terkirim ke:', toEmail);
    } catch (error) {
        console.error('Gagal kirim email:', error);
    }
};

module.exports = { sendNotificationEmail };