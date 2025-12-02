// src/components/Layout.js

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Deteksi Ukuran Layar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setIsMobile(true);
                setIsSidebarOpen(false); // Default tertutup di mobile
            } else {
                setIsMobile(false);
                setIsSidebarOpen(true); // Default terbuka di desktop
            }
        };

        // Cek saat pertama load
        handleResize();

        // Pasang listener
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={styles.layoutContainer}>
            <Sidebar 
                isOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar} 
                isMobile={isMobile} 
            />

            <div className={styles.mainWrapper}>
                {/* Kirim fungsi toggleSidebar ke Header agar bisa bikin tombol hamburger */}
                <Header toggleSidebar={toggleSidebar} isMobile={isMobile} />
                
                <main className={styles.mainContent}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;