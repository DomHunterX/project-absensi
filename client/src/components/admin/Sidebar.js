// src/components/admin/Sidebar.js

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, BookOpen, ClipboardList, Users, User, LogOut, X 
} from 'lucide-react';
import styles from './Sidebar.module.css'; // CSS Khusus Sidebar

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        if(window.confirm('Yakin ingin keluar?')) {
            localStorage.removeItem('token');
            navigate('/admin/login');
        }
    };

    const isLinkActive = (path) => {
        if (path === '/admin' && location.pathname === '/admin') return true;
        return location.pathname.startsWith(path) && path !== '/admin';
    };

    const menuItems = [
        { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/majors', name: 'Manajemen Jurusan', icon: <BookOpen size={20} /> },
        { path: '/admin/rekap', name: 'Rekap Absensi', icon: <ClipboardList size={20} /> },
        { path: '/admin/users', name: 'User Management', icon: <Users size={20} /> },
        { path: '/admin/profile', name: 'Profil Saya', icon: <User size={20} /> },
    ];

    return (
        <>
            {/* OVERLAY GELAP (Khusus Mobile saat sidebar terbuka) */}
            <div 
                className={`${styles.overlay} ${isMobile && isOpen ? styles.showOverlay : ''}`} 
                onClick={toggleSidebar}
            />

            <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed} ${isMobile ? styles.mobile : ''}`}>
                
                {/* Header Sidebar */}
                <div className={styles.sidebarHeader}>
                    {/* Logo/Judul (Sembunyi jika closed di Desktop) */}
                    <h2 className={`${!isOpen && !isMobile ? styles.hideText : ''}`}>Admin Panel</h2>
                    
                    {/* Tombol Close (Hanya di Mobile) */}
                    {isMobile && (
                        <button onClick={toggleSidebar} className={styles.closeBtn}>
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* Menu List */}
                <ul className={styles.navList}>
                    {menuItems.map((item, index) => (
                        <li key={index} className={styles.navItem}>
                            <Link 
                                to={item.path} 
                                className={isLinkActive(item.path) ? styles.active : ''}
                                title={item.name} // Tooltip native saat collapsed
                                onClick={() => isMobile && toggleSidebar()} // Tutup sidebar saat klik menu (Mobile)
                            >
                                <span className={styles.icon}>{item.icon}</span>
                                <span className={`${styles.linkText} ${!isOpen && !isMobile ? styles.hideText : ''}`}>
                                    {item.name}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Logout */}
                <div className={styles.footer}>
                    <button onClick={handleLogout} className={styles.logoutBtn} title="Keluar">
                        <span className={styles.icon}><LogOut size={20} /></span>
                        <span className={`${styles.linkText} ${!isOpen && !isMobile ? styles.hideText : ''}`}>
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;