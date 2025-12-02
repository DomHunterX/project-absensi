// src/components/admin/AdminProfile.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Lock, ShieldCheck } from 'lucide-react';
import styles from './AdminProfile.module.css';

const AdminProfile = () => {
    const [adminData, setAdminData] = useState(null);
    
    // State Form Password
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error'
    const [loading, setLoading] = useState(false);

    const BASE_URL = 'http://localhost:5000';
    const token = localStorage.getItem('token');

    // 1. Ambil Data Diri
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setAdminData(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProfile();
    }, [token]);

    // 2. Handle Input Change
    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    // 3. Handle Submit Ganti Password
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ text: 'Konfirmasi password baru tidak cocok.', type: 'error' });
            return;
        }

        if (passwords.newPassword.length < 6) {
            setMessage({ text: 'Password baru minimal 6 karakter.', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            await axios.put(
                `${BASE_URL}/api/users/change-password`, 
                { 
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword 
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setMessage({ text: 'Password berhasil diubah!', type: 'success' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Reset form
        } catch (err) {
            setMessage({ 
                text: err.response?.data?.msg || 'Gagal mengubah password.', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    if (!adminData) return <div className="p-8 text-center">Memuat profil...</div>;

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.headerSection}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                    <ShieldCheck size={32} />
                </div>
                <div className={styles.titleGroup}>
                    <h1>Profil Saya</h1>
                    <p>Kelola informasi akun dan keamanan</p>
                </div>
            </div>

            <div className={styles.contentGrid}>
                {/* KIRI: INFO PROFIL (Read Only) */}
                <div className={styles.card}>
                    <div className={styles.profileHeader}>
                        <div className={styles.avatarCircle}>
                            <User size={48} />
                        </div>
                        <h2 className={styles.adminName}>{adminData.nama}</h2>
                        <span className={styles.adminRole}>{adminData.role}</span>
                    </div>
                    
                    <div className={styles.infoList}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Email</span>
                            <span className={styles.value}>{adminData.email}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Terdaftar Sejak</span>
                            <span className={styles.value}>
                                {new Date(adminData.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* KANAN: FORM GANTI PASSWORD */}
                <div className={styles.card}>
                    <div className={styles.formHeader}>
                        <h3><Lock size={18} style={{ display: 'inline', marginRight: '8px' }}/> Ganti Password</h3>
                    </div>

                    {message.text && (
                        <div className={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label>Password Saat Ini</label>
                            <input 
                                type="password" 
                                name="currentPassword"
                                value={passwords.currentPassword}
                                onChange={handleChange}
                                className={styles.inputField}
                                placeholder="Masukkan password lama"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Password Baru</label>
                            <input 
                                type="password" 
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handleChange}
                                className={styles.inputField}
                                placeholder="Minimal 6 karakter"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Konfirmasi Password Baru</label>
                            <input 
                                type="password" 
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handleChange}
                                className={styles.inputField}
                                placeholder="Ulangi password baru"
                                required
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;