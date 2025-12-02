// src/components/Sidebar.js

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    Home, 
    User, 
    Clock, 
    LogOut, 
    ChevronLeft, 
    ChevronRight,
    X // Ikon X untuk menutup di mobile
} from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Fungsi menutup sidebar jika di mobile (saat menu diklik)
    const handleItemClick = () => {
        if (isMobile && isOpen) {
            toggleSidebar();
        }
    };

    const menuItems = [
        { path: '/absensi', name: 'Dashboard', icon: <Home size={20} /> },
        { path: '/profile', name: 'Profil Saya', icon: <User size={20} /> },
        { path: '/history', name: 'Riwayat', icon: <Clock size={20} /> },
    ];

    return (
        <>
            {/* OVERLAY KHUSUS MOBILE */}
            <div 
                className={`${styles.overlay} ${isOpen && isMobile ? styles.overlayVisible : ''}`} 
                onClick={toggleSidebar} // Tutup jika overlay diklik
            />

            <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
                
                {/* HEADER SIDEBAR */}
                <div className={styles.sidebarHeader}>
                    {/* Logo selalu muncul di mobile, atau jika desktop terbuka */}
                    {(isOpen || isMobile) && <span className={styles.logoText}>Absensi</span>}
                    
                    {/* Tombol Toggle Desktop (Panah) */}
                    {!isMobile && (
                        <button onClick={toggleSidebar} className={styles.toggleBtn}>
                            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </button>
                    )}

                    {/* Tombol Tutup Mobile (X) */}
                    {isMobile && (
                        <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* MENU NAVIGASI */}
                <nav className={styles.navContainer}>
                    {menuItems.map((item, index) => (
                        <NavLink 
                            key={index}
                            to={item.path}
                            onClick={handleItemClick} // Tutup sidebar saat menu diklik (Mobile)
                            className={({ isActive }) => 
                                `${styles.navItem} ${isActive ? styles.active : ''}`
                            }
                        >
                            <div className={styles.icon}>{item.icon}</div>
                            <span className={`${styles.linkText} ${!isOpen && !isMobile && styles.hidden}`}>
                                {item.name}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                {/* FOOTER LOGOUT */}
                <div className={styles.footer}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <div className={styles.icon}><LogOut size={20} /></div>
                        <span className={`${styles.linkText} ${!isOpen && !isMobile && styles.hidden}`}>
                            Keluar
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;