// src/components/Header.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link & useNavigate
import styles from './Header.module.css';
import { User, Menu, ChevronDown, LogOut } from 'lucide-react'; // Tambah Icon

const Header = ({ toggleSidebar, isMobile }) => {
    const [currentTime, setCurrentTime] = useState('');
    const [userName, setUserName] = useState('');
    
    // State Dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const navigate = useNavigate();

    // 1. Jam Digital
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('id-ID'));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    // 2. Fetch Nama User
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await axios.get('http://localhost:5000/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserName(response.data.nama); 
            } catch (error) {
                console.error("Gagal ambil profil:", error);
            }
        };
        fetchUserData();
    }, []);

    // 3. Fungsi Logout
    const handleLogout = () => {
        if(window.confirm('Apakah Anda yakin ingin keluar?')) {
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                {isMobile && (
                    <button onClick={toggleSidebar} className={styles.hamburgerBtn}>
                        <Menu size={24} />
                    </button>
                )}
                
                <div className={styles.clock}>
                    {currentTime}
                </div>
            </div>

            {/* Bagian Kanan: User Info dengan Dropdown */}
            <div 
                className={styles.userInfo} 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                title="Klik untuk menu"
            >
                <span className={styles.welcomeText}>
                    {userName ? `Halo, ${userName.split(' ')[0]}!` : 'Loading...'}
                </span>
                
                <div className={styles.avatar}>
                    <User size={20} />
                </div>

                <ChevronDown size={16} color="#64748b" />

                {/* --- MENU DROPDOWN --- */}
                {isDropdownOpen && (
                    <div className={styles.dropdownMenu}>
                        
                        {/* Link ke Profil */}
                        <Link 
                            to="/profile" 
                            className={styles.menuItem}
                            onClick={(e) => e.stopPropagation()} // Supaya tidak menutup dropdown saat diklik (opsional, tapi lebih baik redirect langsung)
                        >
                            <User size={18} />
                            <span>Profil Saya</span>
                        </Link>

                        {/* Tombol Logout */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation(); // Mencegah event bubbling ke parent div
                                handleLogout();
                            }} 
                            className={`${styles.menuItem} ${styles.logoutBtn}`}
                        >
                            <LogOut size={18} />
                            <span>Keluar</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;