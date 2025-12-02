// src/components/admin/DashboardAdmin.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Building, ClipboardList, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Dashboard.module.css';

const DashboardAdmin = () => {
    // Inisialisasi state dengan nilai default graphData kosong
    const [stats, setStats] = useState({
        totalUsers: 0, 
        totalMajors: 0, 
        attendanceToday: 0, 
        pendingValidation: 0, 
        recentLogs: [],
        graphData: [] // <--- Data grafik dari backend
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/dashboard/stats', {
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
                <h1>Dashboard Admin</h1>
                <p>Ringkasan aktivitas sistem absensi Polinela</p>
            </div>

            {/* KARTU STATISTIK */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.blue}`}><Users size={24}/></div>
                    <div className={styles.statInfo}><h3>{stats.totalUsers}</h3><p>Total Mahasiswa</p></div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.purple}`}><Building size={24}/></div>
                    <div className={styles.statInfo}><h3>{stats.totalMajors}</h3><p>Total Jurusan</p></div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.green}`}><CheckCircle size={24}/></div>
                    <div className={styles.statInfo}><h3>{stats.attendanceToday}</h3><p>Hadir Hari Ini</p></div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.orange}`}><ClipboardList size={24}/></div>
                    <div className={styles.statInfo}><h3>{stats.pendingValidation}</h3><p>Menunggu Validasi</p></div>
                </div>
            </div>

            {/* KONTEN BAWAH */}
            <div className={styles.bottomSection}>
                
                {/* GRAFIK REAL-TIME (KIRI) */}
                <div className={styles.contentCard}>
                    <h3 className={styles.cardTitle}>Tren Kehadiran (7 Hari Terakhir)</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            {/* Gunakan stats.graphData disini */}
                            <BarChart data={stats.graphData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip 
                                    cursor={{ fill: '#f1f5f9' }} 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="hadir" name="Mahasiswa Hadir" fill="#2196F3" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                        
                        {/* Pesan jika data grafik kosong */}
                        {stats.graphData.length === 0 && (
                            <p style={{textAlign:'center', color:'#94a3b8', marginTop:'-150px'}}>Memuat data grafik...</p>
                        )}
                    </div>
                </div>

                {/* AKTIVITAS TERBARU (KANAN) */}
                <div className={styles.contentCard}>
                    <h3 className={styles.cardTitle}>Absensi Terbaru</h3>
                    <div>
                        {stats.recentLogs.map((log) => (
                            <div key={log.id} className={styles.listItem}>
                                <div>
                                    <span className={styles.userName}>{log.User?.nama}</span>
                                    <span className={styles.userMeta}>{log.User?.kelas} • {new Date(log.date).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <span className={`${styles.statusTag} ${log.status === 'Hadir' ? styles.tagHadir : styles.tagPending}`}>
                                    {log.status}
                                </span>
                            </div>
                        ))}
                        {stats.recentLogs.length === 0 && <p style={{color:'#94a3b8', textAlign:'center', padding:'20px'}}>Belum ada aktivitas absensi.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAdmin;