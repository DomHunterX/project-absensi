// src/components/timdis/DashboardTimdis.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../admin/Dashboard.module.css'; // Reuse CSS Admin

const DashboardTimdis = () => {
    const [stats, setStats] = useState({
        attendanceToday: 0, pendingValidation: 0, recentLogs: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('https://absensi-polinela.site/api/dashboard/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (err) { console.error(err); }
        };
        fetchStats();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Panel Tim Disiplin</h1>
                <p>Pantau dan validasi kehadiran mahasiswa hari ini</p>
            </div>

            {/* HIGHLIGHT CARD KHUSUS TIMDIS */}
            <div style={{ 
                background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                borderRadius: '16px', padding: '2rem', color: 'white',
                marginBottom: '2rem', boxShadow: '0 10px 20px -5px rgba(245, 158, 11, 0.4)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div>
                    <h2 style={{margin:0, fontSize:'2.5rem', fontWeight:'800'}}>{stats.pendingValidation}</h2>
                    <p style={{margin:0, opacity:0.9, fontSize:'1.1rem'}}>Mahasiswa Menunggu Validasi Foto</p>
                </div>
                <div>
                    <Link to="/timdis/rekap" style={{
                        background: 'white', color: '#d97706', padding: '12px 24px', 
                        borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <AlertTriangle size={20}/> Proses Sekarang
                    </Link>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.green}`}><CheckCircle size={24}/></div>
                    <div className={styles.statInfo}><h3>{stats.attendanceToday}</h3><p>Total Absen Masuk</p></div>
                </div>
                {/* Tambah kartu lain sesuai kebutuhan */}
            </div>

            <div className={styles.contentCard}>
                <h3 className={styles.cardTitle}>Antrian Masuk Terbaru</h3>
                {stats.recentLogs.map((log) => (
                    <div key={log.id} className={styles.listItem}>
                        <div>
                            <span className={styles.userName}>{log.User?.nama}</span>
                            <span className={styles.userMeta}>
                                {log.User?.kelas} • <Clock size={12} style={{display:'inline'}}/> {new Date(log.date).toLocaleTimeString('id-ID')}
                            </span>
                        </div>
                        <span className={`${styles.statusTag} ${log.status === 'Hadir' ? styles.tagHadir : styles.tagPending}`}>
                            {log.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardTimdis;