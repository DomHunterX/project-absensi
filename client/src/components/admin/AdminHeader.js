// src/components/admin/AdminHeader.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; 
import { Clock, User, LogOut, ChevronDown, Menu } from 'lucide-react'; // Tambah icon Menu
import styles from './AdminHeader.module.css';

// TERIMA PROP 'toggleSidebar'
const AdminHeader = ({ toggleSidebar }) => {
    const [currentTime, setCurrentTime] = useState('');
    const [adminName, setAdminName] = useState('Admin');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    // ... (Logika useEffect Jam & Fetch Profile TETAP SAMA) ...
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            setCurrentTime(now.toLocaleDateString('id-ID', options));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('https://absensi-polinela.site/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } });
                setAdminName(res.data.nama || 'Administrator');
            } catch (err) { console.error(err); }
        };
        fetchAdminProfile();
    }, []);

    const handleLogout = () => {
        if(window.confirm('Yakin ingin keluar?')) {
            localStorage.removeItem('token');
            navigate('/admin/login');
        }
    };

    return (
        <header className={styles.headerContainer}>
            <div className={styles.leftSection}>
                {/* TOMBOL HAMBURGER (Untuk toggle sidebar) */}
                <button 
                    onClick={toggleSidebar} 
                    style={{ 
                        background: 'none', border: 'none', cursor: 'pointer', 
                        marginRight: '15px', color: '#64748b', display: 'flex' 
                    }}
                >
                    <Menu size={24} />
                </button>

                <div className={styles.clockWrapper}>
                    <Clock size={18} className="text-blue-500" />
                    {/* Hide jam di layar HP kecil biar muat */}
                    <span style={{ display: 'none', '@media(min-width: 600px)': { display: 'inline' } }}>
                        {/* Trik CSS inline media query agak tricky di JS, lebih baik via CSS module */}
                        {/* Gunakan class CSS untuk hide di mobile jika perlu */}
                        {currentTime}
                    </span>
                    <span className={styles.hideOnMobile}>{currentTime}</span>
                </div>
            </div>

            <div className={styles.rightSection} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <div className={styles.welcomeText}>
                    <span className={styles.greeting}>Selamat Datang,</span>
                    <span className={styles.adminName}>{adminName.split(' ')[0]}</span>
                </div>
                <div className={styles.avatarCircle}><User size={20} /></div>
                <ChevronDown size={16} color="#64748b" />

                {isDropdownOpen && (
                    <div className={styles.dropdownMenu}>
                        <Link to="/admin/profile" className={styles.menuItem} style={{textDecoration:'none', color:'#333'}}>
                            <User size={16} /> Profil Saya
                        </Link>
                        <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className={`${styles.menuItem} ${styles.logoutBtn}`}>
                            <LogOut size={16} /> Keluar
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default AdminHeader;