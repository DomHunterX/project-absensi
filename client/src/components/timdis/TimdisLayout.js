import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ClipboardList, User } from 'lucide-react';
import styles from './TimdisLayout.module.css';
import AdminHeader from '../admin/AdminHeader'; // Kita reuse Header Admin (karena fungsinya sama)

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        if(window.confirm('Yakin ingin keluar?')) {
            localStorage.removeItem('token');
            navigate('/admin/login');
        }
    };

    const isLinkActive = (path) => {
        if (path === '/timdis' && location.pathname === '/timdis') return true;
        return location.pathname.startsWith(path) && path !== '/timdis';
    };

    return (
        <div className={styles.sidebar}>
            <h2>Timdis Panel</h2>
            <ul className={styles.navList}>
                {/* 1. DASHBOARD */}
                <li className={styles.navItem}>
                    <Link to="/timdis" className={isLinkActive('/timdis') ? styles.active : ''}>
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                </li>

                {/* 2. Profil Saya */}
                <li className={styles.navItem}>
                    <Link to="/timdis/profile" className={isLinkActive('/timdis/profile') ? styles.active : ''}>
                        <User size={20} />
                        Profil Saya
                    </Link>
                </li>

                {/* 3. MANAJEMEN JURUSAN */}
                <li className={styles.navItem}>
                    <Link to="/timdis/majors" className={isLinkActive('/timdis/majors') ? styles.active : ''}>
                        <BookOpen size={20} />
                        Manajemen Jurusan
                    </Link>
                </li>

                {/* 4. REKAP ABSENSI */}
                <li className={styles.navItem}>
                    <Link to="/timdis/rekap" className={isLinkActive('/timdis/rekap') ? styles.active : ''}>
                        <ClipboardList size={20} />
                        Rekap Absensi
                    </Link>
                </li>

            </ul>
            <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
        </div>
    );
};

const TimdisLayout = () => {
    return (
        <div className={styles.layoutContainer}>
            <Sidebar />
            <main className={styles.mainContent}>
                <AdminHeader /> {/* Header tetap sama, menampilkan nama user yang login */}
                <Outlet />
            </main>
        </div>
    );
};

export default TimdisLayout;