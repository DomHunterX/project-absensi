import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Attendance from './Attendance.js';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const BASE_URL = 'https://absensi-polinela.site';

    // Fetch user profile
// Fetch user profile (DIPERBAIKI ENDPOINT)
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                // Menggunakan endpoint yang benar: /api/users/me
                const res = await axios.get(`${BASE_URL}/api/users/me`, { 
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUser(res.data);
            } catch (err) {
                console.error('Gagal mengambil profil', err);
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                }
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Tambahkan log saat user berhasil dimuat (opsional)
    // if (user) console.log("User Data Loaded:", user);

    return (
        <>
            <main className={styles['dashboard-container']}>
                <div className={styles['app-wrapper']}>
                    {/* Component Attendance sekarang berisi semua logika absensi */}
                    <Attendance /> 
                </div>
            </main>
        </>
    );
};

export default Dashboard;
