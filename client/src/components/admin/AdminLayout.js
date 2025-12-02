// src/components/admin/AdminLayout.js

import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
// Tambahkan import icon 'User'
import { LayoutDashboard, BookOpen, ClipboardList, Users, User } from 'lucide-react'; 
import styles from './AdminLayout.module.css';
import AdminHeader from './AdminHeader';

// --- Sidebar Component ---
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
        if (path === '/admin' && location.pathname === '/admin') return true;
        return location.pathname.startsWith(path) && path !== '/admin';
    };

    return (
        <div className={styles.sidebar}>
            <h2>Admin Panel</h2>
            <ul className={styles.navList}>
                {/* 1. DASHBOARD */}
                <li className={styles.navItem}>
                    <Link 
                        to="/admin" 
                        className={isLinkActive('/admin') ? styles.active : ''}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                </li>

                {/* 2. PROFIL SAYA (BARU) */}
                <li className={styles.navItem}>
                    <Link 
                        to="/admin/profile" 
                        className={isLinkActive('/admin/profile') ? styles.active : ''}
                    >
                        <User size={20} />
                        Profil Saya
                    </Link>
                </li>

                {/* 3. MANAJEMEN JURUSAN */}
                <li className={styles.navItem}>
                    <Link 
                        to="/admin/majors"
                        className={isLinkActive('/admin/majors') ? styles.active : ''}
                    >
                        <BookOpen size={20} />
                        Manajemen Jurusan
                    </Link>
                </li>

                {/* 4. REKAP ABSENSI */}
                <li className={styles.navItem}>
                    <Link 
                        to="/admin/rekap" 
                        className={isLinkActive('/admin/rekap') ? styles.active : ''}
                    >
                        <ClipboardList size={20} />
                        Rekap Absensi
                    </Link>
                </li>

                {/* 5. USER MANAGEMENT */}
                <li className={styles.navItem}>
                    <Link 
                        to="/admin/users" 
                        className={isLinkActive('/admin/users') ? styles.active : ''}
                    >
                        <Users size={20} />
                        User Management
                    </Link>
                </li>
            </ul>
        </div>
    );
};

const AdminLayout = () => {
    return (
        <div className={styles.layoutContainer}>
            <Sidebar />
            <main className={styles.mainContent}>
                <AdminHeader /> 
                <Outlet /> 
            </main>
        </div>
    );
};

export default AdminLayout;