// src/components/admin/AttendanceLog.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2'; // Tambahkan SweetAlert
import { 
    ClipboardList, Download, Search, RotateCcw, 
    Eye, X, ChevronLeft, ChevronRight,
    CheckCircle, XCircle // Icon baru
} from 'lucide-react';
import styles from './AttendanceLog.module.css';

const AttendanceLog = () => {
    const [log, setLog] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [programs, setPrograms] = useState([]); 
    const [selectedProgram, setSelectedProgram] = useState('');
    const [filterKelas, setFilterKelas] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const BASE_URL = 'https://absensi-polinela.site';

    useEffect(() => {
        fetchPrograms();
        fetchLog(); 
        // eslint-disable-next-line
    }, []);

    const fetchPrograms = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/majors/all`);
            const allPrograms = res.data.flatMap(major => 
                major.StudyPrograms.map(prog => ({ id: prog.id, name: `${prog.name} (${major.name})` }))
            );
            setPrograms(allPrograms);
        } catch (err) { console.error(err); }
    };

    const fetchLog = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = {};
            if (selectedProgram) params.programId = selectedProgram;
            if (filterKelas) params.kelas = filterKelas;

            const res = await axios.get(`${BASE_URL}/api/attendance/all`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: params 
            });
            setLog(res.data);
            setCurrentPage(1); 
            setError('');
        } catch (err) {
            setError(err.response?.data?.msg || 'Gagal memuat data log.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterSubmit = (e) => { e.preventDefault(); fetchLog(); };
    const handleViewDetail = (item) => { setSelectedDetail(item); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setSelectedDetail(null); };

    // --- FUNGSI VALIDASI BARU ---
    const handleValidation = async (status) => {
        if (!selectedDetail) return;

        const confirmText = status === 'Hadir' 
            ? 'Terima absensi ini? Foto bukti akan dihapus permanen.' 
            : 'Tolak absensi ini?';

        const result = await Swal.fire({
            title: 'Konfirmasi Validasi',
            text: confirmText,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: status === 'Hadir' ? 'Ya, Terima' : 'Ya, Tolak',
            confirmButtonColor: status === 'Hadir' ? '#10b981' : '#ef4444'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.put(`${BASE_URL}/api/attendance/validate/${selectedDetail.id}`, 
                    { status }, 
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );

                Swal.fire('Berhasil', `Status diubah menjadi ${status}`, 'success');
                setIsModalOpen(false); // Tutup modal
                fetchLog(); // Refresh data
            } catch (err) {
                Swal.fire('Gagal', 'Terjadi kesalahan server', 'error');
            }
        }
    };

    const handleExport = () => {
        const dataToExport = log.map(item => ({
            'Nama': item.User?.nama || 'N/A',
            'NPM': item.User?.npm || 'N/A',
            'Kelas': item.User?.kelas || '-',
            'Prodi': item.User?.StudyProgram?.name || '-',
            'Waktu': new Date(item.date).toLocaleString('id-ID'),
            'Status': item.status
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Rekap');
        XLSX.writeFile(wb, `Rekap_Absensi_${filterKelas || 'Semua'}.xlsx`);
    };

    // Helper Status Class
    const getStatusClass = (status) => {
        if (status === 'Hadir') return ''; // Default hijau di CSS modul
        if (status === 'Menunggu Validasi') return styles.pending;
        return styles.rejected;
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLogs = log.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(log.length / itemsPerPage);
    const handlePageChange = (page) => setCurrentPage(page);

    return (
        <div className={styles.pageContainer}>
            
            {/* --- MODAL DETAIL (UPDATED) --- */}
            {isModalOpen && selectedDetail && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Detail Absensi</h3>
                            <button onClick={closeModal} className={styles.closeBtn}><X size={24} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            
                            {/* AREA PERBANDINGAN FOTO */}
                            <div className={styles.comparisonContainer}>
                                {/* 1. Foto Profil (Database) */}
                                <div className={styles.photoWrapper}>
                                    <span className={styles.photoLabel}>Foto Profil (Asli)</span>
                                    {selectedDetail.User?.foto_profil ? (
                                        <img 
                                            src={`${BASE_URL}/${selectedDetail.User.foto_profil}`} 
                                            alt="Profil" 
                                            className={styles.profileImage} 
                                        />
                                    ) : <div className={styles.noPhoto}>No Photo</div>}
                                </div>

                                {/* 2. Foto Bukti (Saat Absen) */}
                                <div className={styles.photoWrapper}>
                                    <span className={styles.photoLabel}>Foto Bukti (Live)</span>
                                    {selectedDetail.bukti_foto ? (
                                        <img 
                                            src={`${BASE_URL}/${selectedDetail.bukti_foto}`} 
                                            alt="Bukti" 
                                            className={styles.proofImage} 
                                        />
                                    ) : (
                                        <div className={styles.noPhoto} style={{color: selectedDetail.status === 'Hadir' ? '#10b981' : '#94a3b8'}}>
                                            {selectedDetail.status === 'Hadir' ? 'Terverifikasi (Dihapus)' : 'Tidak Ada'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className={styles.infoGrid}>
                                <div className={`${styles.infoItem} ${styles.fullWidth}`}><span className={styles.infoLabel}>Nama Mahasiswa</span><span className={styles.infoValue}>{selectedDetail.User?.nama}</span></div>
                                <div className={styles.infoItem}><span className={styles.infoLabel}>NPM</span><span className={styles.infoValue}>{selectedDetail.User?.npm}</span></div>
                                <div className={styles.infoItem}><span className={styles.infoLabel}>Kelas</span><span className={styles.infoValue}>{selectedDetail.User?.kelas || '-'}</span></div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Status</span>
                                    <span className={`${styles.statusBadge} ${getStatusClass(selectedDetail.status)}`}>
                                        {selectedDetail.status}
                                    </span>
                                </div>
                                <div className={styles.infoItem}><span className={styles.infoLabel}>Waktu Absen</span><span className={styles.infoValue}>{new Date(selectedDetail.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })}</span></div>
                                <div className={`${styles.infoItem} ${styles.fullWidth}`}><span className={styles.infoLabel}>Program Studi</span><span className={styles.infoValue}>{selectedDetail.User?.StudyProgram?.name || '-'}</span></div>
                            </div>

                            {/* TOMBOL VALIDASI (Hanya Muncul Jika Pending) */}
                            {selectedDetail.status === 'Menunggu Validasi' && (
                                <div className={styles.validationActions}>
                                    <button onClick={() => handleValidation('Ditolak')} className={styles.btnReject}>
                                        <XCircle size={18} /> Tolak
                                    </button>
                                    <button onClick={() => handleValidation('Hadir')} className={styles.btnApprove}>
                                        <CheckCircle size={18} /> Terima (Valid)
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

            {/* HEADER & FILTER (TETAP SAMA) */}
            <div className={styles.headerSection}>
                <div className={styles.titleGroup}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ClipboardList size={32} />
                        <h1>Log & Validasi Absensi</h1>
                    </div>
                    <p style={{ marginLeft: '44px' }}>Pantau kehadiran dan validasi bukti foto</p>
                </div>
                <button onClick={handleExport} disabled={log.length === 0} className={styles.exportBtn}><Download size={18} /> Download Excel</button>
            </div>

            <form onSubmit={handleFilterSubmit} className={styles.filterCard}>
                <select value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)} className={styles.filterSelect}>
                    <option value="">-- Semua Program Studi --</option>
                    {programs.map(prog => (<option key={prog.id} value={prog.id}>{prog.name}</option>))}
                </select>
                <input type="text" placeholder="Cari Kelas (Cth: 3A)" value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)} className={styles.filterInput} />
                <button type="submit" className={styles.filterBtn}><Search size={16}/> Terapkan</button>
                <button type="button" onClick={() => window.location.reload()} className={styles.resetBtn} title="Reset Filter"><RotateCcw size={16} /></button>
            </form>

            <div style={{ marginBottom: '1rem', fontWeight: '600', color: '#64748b' }}>Menampilkan {log.length} data</div>

            {/* TABEL */}
            <div className={styles.tableContainer}>
                {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Memuat data...</div> : (
                    <>
                        <table className={styles.logTable}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Nama Mahasiswa</th>
                                    <th className={styles.th}>Identitas</th>
                                    <th className={styles.th}>Waktu Absen</th>
                                    <th className={styles.th}>Status</th>
                                    <th className={styles.th} style={{ textAlign: 'center' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentLogs.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Tidak ada data ditemukan.</td></tr>
                                ) : (
                                    currentLogs.map(item => (
                                        <tr key={item.id} className={styles.tr}>
                                            <td className={styles.td}>
                                                <span style={{ fontWeight: '600', color: '#1e293b' }}>{item.User?.nama || '-'}</span>
                                            </td>
                                            <td className={styles.td}>
                                                <div style={{fontFamily: 'monospace'}}>{item.User?.npm}</div>
                                                <div style={{fontSize: '0.8rem', color: '#64748b'}}>Kelas: {item.User?.kelas}</div>
                                            </td>
                                            <td className={styles.td}>{new Date(item.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                            <td className={styles.td}>
                                                <span className={`${styles.statusBadge} ${getStatusClass(item.status)}`}>{item.status}</span>
                                            </td>
                                            <td className={styles.tdCenter}> 
                                                <button onClick={() => handleViewDetail(item)} className={`${styles.actionBtn} ${styles.detail}`} title="Lihat & Validasi">
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        
                        {/* PAGINATION (TETAP SAMA) */}
                        {totalPages > 1 && (
                            <div className={styles.paginationContainer}>
                                <button className={styles.pageBtn} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft size={16} /></button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i + 1} onClick={() => handlePageChange(i + 1)} className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.active : ''}`}>{i + 1}</button>
                                ))}
                                <button className={styles.pageBtn} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight size={16} /></button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AttendanceLog;