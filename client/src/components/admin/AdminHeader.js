// src/components/admin/AdminHeader.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { Clock, User, LogOut, ChevronDown } from 'lucide-react'; // Import Icon tambahan
import styles from './AdminHeader.module.css';

const AdminHeader = () => {
    const [currentTime, setCurrentTime] = useState('');
    const [adminName, setAdminName] = useState('Admin');
    
    // State untuk Dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const navigate = useNavigate(); // Hook navigasi

    // 1. Logika Jam (Tetap)
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const options = { 
                weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit' 
            };
            setCurrentTime(now.toLocaleDateString('id-ID', options));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    // 2. Ambil Data Admin (Tetap)
    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('https://absensi-polinela.site/api/users/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setAdminName(res.data.nama || 'Administrator');
            } catch (err) { console.error(err); }
        };
        fetchAdminProfile();
    }, []);

    // 3. Fungsi Logout (Duplikat dari Sidebar)
    const handleLogout = () => {
        if(window.confirm('Apakah Anda yakin ingin keluar?')) {
            localStorage.removeItem('token');
            navigate('/admin/login');
        }
    };

    return (
        <header className={styles.headerContainer}>
            {/* Kiri: Jam */}
            <div className={styles.leftSection}>
                <div className={styles.clockWrapper}>
                    <Clock size={18} className="text-blue-500" />
                    <span>{currentTime}</span>
                </div>
            </div>

            {/* Kanan: Profil & Dropdown */}
            {/* Tambahkan onClick untuk toggle dropdown */}
            <div 
                className={styles.rightSection} 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                title="Klik untuk opsi akun"
            >
                <div className={styles.welcomeText}>
                    <span className={styles.greeting}>Selamat Datang,</span>
                    <span className={styles.adminName}>{adminName}</span>
                </div>
                
                <div className={styles.avatarCircle}>
                    <User size={20} />
                </div>
                
                {/* Indikator Panah Kecil */}
                <ChevronDown size={16} color="#64748b" />

                {/* --- MENU DROPDOWN --- */}
                {isDropdownOpen && (
                    <div className={styles.dropdownMenu}>
                        {/* Bisa tambah menu lain di sini, misal Profile */}
                        <Link to="/admin/profile" className={styles.menuItem} style={{ textDecoration: 'none', color: '#333' }}>
                            <User size={16} />
                            <span>Profil Saya</span>
                        </Link>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation(); // Mencegah event bubbling ke parent
                                handleLogout();
                            }} 
                            className={`${styles.menuItem} ${styles.logoutBtn}`}
                        >
                            <LogOut size={16} />
                            <span>Keluar</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default AdminHeader;