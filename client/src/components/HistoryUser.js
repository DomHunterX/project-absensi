// src/components/HistoryUser.js

import React, { useState, useEffect, useMemo } from 'react'; // PASTIKAN useMemo DIIMPOR DI SINI
import { Link } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar'; // Import Kalender
import 'react-calendar/dist/Calendar.css'; // Import CSS bawaan
import styles from './HistoryUser.module.css';
import { Calendar as CalendarIcon, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const HistoryUser = () => {
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    
    // State untuk tanggal yang dipilih di kalender (Default hari ini)
    const [selectedDate, setSelectedDate] = useState(new Date());

    // ▼▼▼ State untuk Pagination ▼▼▼
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Batasi 5 riwayat per halaman
    // ▲▲▲ BATAS BARU ▲▲▲

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoadingHistory(false);
                    return;
                }
                const res = await axios.get('https://absensi-polinela.site/api/attendance/history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setHistory(res.data);
            } catch (err) {
                console.error('Gagal mengambil riwayat absensi', err);
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, []);

    // --- LOGIKA FILTERING & PAGINATION ---
    const filteredHistory = useMemo(() => {
        // 1. Filter berdasarkan tanggal yang dipilih
        const filtered = history.filter(item => {
            const itemDate = new Date(item.date);
            // Bandingkan Tanggal, Bulan, dan Tahun
            return (
                itemDate.getDate() === selectedDate.getDate() &&
                itemDate.getMonth() === selectedDate.getMonth() &&
                itemDate.getFullYear() === selectedDate.getFullYear()
            );
        });
        
        // Catatan: currentPage direset via handleDateChange, bukan di sini
        
        return filtered;
    }, [history, selectedDate]); 

    // 2. Hitung total halaman
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

    // 3. Hitung item untuk halaman saat ini
    const currentItems = filteredHistory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // 4. Handlers Pagination
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    
    // Perubahan tanggal kalender akan selalu kembali ke halaman 1
    const handleDateChange = (date) => {
        setSelectedDate(date);
        setCurrentPage(1); // RESET currentPage saat tanggal diubah
    };
    
    // --- KOMPONEN PAGINATION CONTROLS ---
    const PaginationControls = () => {
        if (totalPages <= 1) return null;
        
        // Buat array penomoran halaman (misalnya [1, 2, 3])
        const pages = [...Array(totalPages).keys()].map(i => i + 1);

        return (
            <div className={styles['pagination-controls']}>
                {/* Tombol Sebelumnya */}
                <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={styles['pagination-btn']}
                >
                    <ChevronLeft size={16} />
                </button>
                
                {/* Penomoran Halaman */}
                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`${styles['pagination-btn']} ${currentPage === page ? styles['active-page'] : ''}`}
                    >
                        {page}
                    </button>
                ))}

                {/* Tombol Selanjutnya */}
                <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={styles['pagination-btn']}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        );
    };
    
    // ------------------------------------

    return (
        <div className={styles['page-container']}>
            <div className={styles['history-header']}>
                <Link to="/absensi" className={styles['back-button']}>&larr; Kembali ke Dashboard</Link>
                <h2>Riwayat Absensi</h2>
            </div>
            
            <div className={styles['content-wrapper']}>
                
                {/* BAGIAN KIRI: KALENDER */}
                <div className={styles['calendar-section']}>
                    <div className={styles['calendar-card']}>
                        <h3>Pilih Tanggal</h3>
                        <Calendar 
                            onChange={handleDateChange} // Menggunakan handler baru
                            value={selectedDate}
                            locale="id-ID" // Set bahasa Indonesia
                            className={styles['react-calendar']}
                        />
                        <p className={styles['selected-date-info']}>
                            <strong>{selectedDate.toLocaleDateString('id-ID', { dateStyle: 'full' })}</strong>
                        </p>
                    </div>
                </div>

                {/* BAGIAN KANAN: LIST ABSENSI */}
                <div className={styles['list-section']}>
                    {loadingHistory ? (
                        <p className={styles['loading-text']}>Loading riwayat...</p>
                    ) : filteredHistory.length === 0 ? (
                        // Tampilan jika TIDAK ADA data pada tanggal tersebut
                        <div className={styles['empty-state']}>
                            <CalendarIcon size={48} color="#ccc" />
                            <p>Tidak ada catatan absensi pada tanggal ini.</p>
                        </div>
                    ) : (
                        // Tampilan jika ADA data
                        <>
                            <ul className={styles['history-list']}>
                                {/* Map menggunakan currentItems (hasil pagination) */}
                                {currentItems.map(item => (
                                    <li key={item.id} className={styles['history-item']}>
                                        <div className={styles['item-left']}>
                                            <div className={styles['icon-wrapper']}>
                                                {item.status === 'Hadir' ? <CheckCircle size={20} color="#4CAF50" /> : <XCircle size={20} color="#F44336" />}
                                            </div>
                                            <div className={styles['history-details']}>
                                                <span className={styles['history-time']}>
                                                    {new Date(item.date).toLocaleTimeString('id-ID', { 
                                                        hour: '2-digit', minute: '2-digit' 
                                                    })} WIB
                                                </span>
                                                <span className={styles['history-date-text']}>
                                                    {new Date(item.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`${styles['history-status']} ${item.status === 'Hadir' ? styles['status-success'] : styles['status-fail']}`}>
                                            {item.status}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            
                            {/* Render Kontrol Pagination */}
                            <PaginationControls />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryUser;