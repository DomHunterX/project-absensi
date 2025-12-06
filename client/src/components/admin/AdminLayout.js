// src/components/admin/AdminLayout.js

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ClipboardList, Users, User, LogOut, X, ChevronLeft } from 'lucide-react'; 
import styles from './AdminLayout.module.css';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar'; // Kita pisahkan Sidebar ke file sendiri agar rapi

const AdminLayout = () => {
    // State Sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Deteksi Ukuran Layar (Responsive)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 900) {
                setIsMobile(true);
                setIsSidebarOpen(false); // Default tutup di mobile
            } else {
                setIsMobile(false);
                setIsSidebarOpen(true); // Default buka di desktop
            }
        };

        handleResize(); // Cek awal
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={styles.layoutContainer}>
            {/* Sidebar menerima props status */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar} 
                isMobile={isMobile} 
            />

            <div className={`${styles.mainWrapper} ${!isSidebarOpen && !isMobile ? styles.expanded : ''}`}>
                {/* Header menerima fungsi toggle untuk tombol hamburger */}
                <AdminHeader toggleSidebar={toggleSidebar} isMobile={isMobile} />
                
                <main className={styles.mainContent}>
                    <Outlet /> 
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;