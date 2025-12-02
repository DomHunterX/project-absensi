// src/components/Profile.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Lock, Camera, ShieldCheck, Save } from 'lucide-react';
import styles from './Profile.module.css';

const Profile = () => {
    // ... (STATE DAN LOGIC JS TIDAK BERUBAH) ...
    const [formData, setFormData] = useState({ nama: '', npm: '', kelas: '', email: '', programName: '', majorName: '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [currentPicture, setCurrentPicture] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');
    const BASE_URL = 'http://localhost:5000';
    const api = axios.create({ baseURL: BASE_URL, headers: { Authorization: `Bearer ${token}` } });

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/api/users/me');
            const user = res.data;
            setFormData({
                nama: user.nama || '',
                npm: user.npm || '',
                kelas: user.kelas || '', 
                email: user.email || '',
                programName: user.StudyProgram ? user.StudyProgram.name : 'Belum Ditentukan',
                majorName: user.StudyProgram?.Major ? user.StudyProgram.Major.name : 'Belum Ditentukan'
            });
            if (user.foto_profil) setCurrentPicture(`${BASE_URL}/${user.foto_profil.replace(/\\/g, '/')}`);
        } catch (err) { console.error("Error fetching profile", err); }
    };

    const handleDataChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handlePassChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    const handleDataSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setMessage({ text: '', type: '' });
        try { await api.put('/api/users/me', { nama: formData.nama }); setMessage({ text: 'Data diri berhasil diperbarui!', type: 'success' }); } 
        catch (err) { setMessage({ text: err.response?.data?.msg || 'Gagal update.', type: 'error' }); } 
        finally { setLoading(false); }
    };

    const handlePassSubmit = async (e) => {
        e.preventDefault(); setMessage({ text: '', type: '' });
        if (passwords.newPassword !== passwords.confirmPassword) return setMessage({ text: 'Konfirmasi password tidak cocok.', type: 'error' });
        if (passwords.newPassword.length < 6) return setMessage({ text: 'Min. 6 karakter.', type: 'error' });
        setLoading(true);
        try { await api.put('/api/users/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }); setMessage({ text: 'Password berhasil diubah!', type: 'success' }); setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); } 
        catch (err) { setMessage({ text: err.response?.data?.msg || 'Gagal ubah password.', type: 'error' }); } 
        finally { setLoading(false); }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        const pictureData = new FormData(); pictureData.append('profilePicture', file);
        setLoading(true);
        try { const res = await api.post('/api/users/upload-profile', pictureData, { headers: { 'Content-Type': 'multipart/form-data' } }); setMessage({ text: 'Foto berhasil diupload!', type: 'success' }); setCurrentPicture(`${BASE_URL}/${res.data.filePath.replace(/\\/g, '/')}`); } 
        catch (err) { setMessage({ text: err.response?.data?.msg || 'Gagal upload.', type: 'error' }); } 
        finally { setLoading(false); }
    };

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.headerSection}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '15px' }}>
                    <ShieldCheck size={40} />
                </div>
                <div className={styles.titleGroup}>
                    <h1>Profil Mahasiswa</h1>
                    <p>Kelola data diri dan keamanan akun Anda</p>
                </div>
            </div>

            {message.text && (
                <div className={`${styles.message} ${message.type === 'error' ? styles.error : styles.success}`}>
                    {message.text}
                </div>
            )}

            {/* --- TOP SECTION: FOTO & DATA AKADEMIK (SEJAJAR) --- */}
            <div className={styles.topSection}>
                
                {/* 1. KIRI: FOTO PROFIL */}
                <div className={`${styles.card} ${styles.profileCard}`}>
                    <div className={styles.imageWrapper}>
                        {currentPicture ? (
                            <img src={currentPicture} alt="Profil" className={styles.profileImage} />
                        ) : (
                            <div className={styles.placeholderImage}><Camera size={40} /></div>
                        )}
                        <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#10b981', padding: '6px', borderRadius: '50%', border: '3px solid white' }}>
                            <ShieldCheck size={16} color="white" />
                        </div>
                    </div>
                    
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#1e293b' }}>{formData.nama || 'Mahasiswa'}</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{formData.npm}</p>

                    <label htmlFor="file-upload" className={styles.uploadLabel}>
                        {loading ? 'Mengupload...' : 'Pilih Foto'}
                    </label>
                    <input id="file-upload" type="file" onChange={handleFileChange} accept="image/*" className={styles.hiddenInput} />
                    
                    <p className={styles.warningText}>
                        *Foto ini digunakan sebagai referensi wajah saat absensi. Pastikan wajah terlihat jelas.
                    </p>
                </div>

                {/* 2. KANAN: DATA AKADEMIK */}
                <div className={styles.card}>
                    <div className={styles.sectionTitle}>
                        <User size={20} className="text-blue-500" /> Data Akademik
                    </div>
                    
                    <form onSubmit={handleDataSubmit} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div className={styles.formGrid}>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Nama Lengkap</label>
                                <input type="text" name="nama" value={formData.nama} onChange={handleDataChange} className={styles.input} required />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>NPM</label>
                                <input type="text" value={formData.npm} className={styles.input} readOnly />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Kelas</label>
                                <input type="text" value={formData.kelas} className={styles.input} readOnly placeholder="Belum diatur admin" />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Program Studi</label>
                                <input type="text" value={formData.programName} className={styles.input} readOnly />
                            </div>

                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Jurusan</label>
                                <input type="text" value={formData.majorName} className={styles.input} readOnly />
                            </div>
                        </div>
                        <button type="submit" className={styles.submitBtn} disabled={loading} style={{ marginTop: 'auto' }}>
                            <Save size={18} style={{ display: 'inline', marginRight: '8px' }} /> 
                            Simpan Perubahan
                        </button>
                    </form>
                </div>
            </div>

            {/* --- BOTTOM SECTION: GANTI PASSWORD (FULL WIDTH) --- */}
            <div className={styles.card}>
                <div className={styles.sectionTitle}>
                    <Lock size={20} className="text-blue-500" /> Ganti Password
                </div>
                
                <form onSubmit={handlePassSubmit}>
                    <div className={styles.formGrid} style={{ gridTemplateColumns: '1fr 1fr 1fr' }}> 
                        {/* Membuat input password sejajar 3 kolom jika layar lebar */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Password Saat Ini</label>
                            <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePassChange} className={styles.input} placeholder="Password lama" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Password Baru</label>
                            <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePassChange} className={styles.input} placeholder="Min. 6 karakter" required />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Konfirmasi</label>
                            <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePassChange} className={styles.input} placeholder="Ulangi password baru" required />
                        </div>
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading} style={{ marginTop: '10px', width: 'auto', alignSelf: 'flex-end', paddingLeft: '2rem', paddingRight: '2rem' }}>
                        Simpan Password Baru
                    </button>
                </form>
            </div>

        </div>
    );
};

export default Profile;