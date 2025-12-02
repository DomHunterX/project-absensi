// src/components/admin/UserManagement.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Tambahkan Icon Plus
import { Users, RefreshCw, Loader, Edit, Trash2, X, ChevronLeft, ChevronRight, Plus } from 'lucide-react'; 
import styles from './UserManagement.module.css';

const BASE_URL = 'https://absensi-polinela.site';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [majors, setMajors] = useState([]);
    
    // State Modal Edit
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    
    // ▼▼▼ STATE MODAL TAMBAH BARU ▼▼▼
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addData, setAddData] = useState({ 
        nama: '', npm: '', email: '', password: '', role: 'user', studyProgramId: '', kelas: '' 
    });

    // State Form Edit (Dipisah agar tidak bentrok)
    const [editData, setEditData] = useState({ nama: '', email: '', role: '', studyProgramId: '', kelas: '' });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const token = localStorage.getItem('token');
    const api = axios.create({ baseURL: BASE_URL, headers: { 'Authorization': `Bearer ${token}` } });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try { await Promise.all([fetchUsers(), fetchMajorsAndPrograms()]); } 
        catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    const fetchUsers = async () => {
        setRefreshing(true);
        try {
            const res = await api.get('/api/users/all');
            setUsers(res.data || []);
            setCurrentPage(1);
        } catch (err) { alert('Gagal memuat user.'); } 
        finally { setRefreshing(false); }
    };
    
    const fetchMajorsAndPrograms = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/majors/all`); 
            setMajors(res.data);
        } catch (err) {}
    };

    // --- HANDLER EDIT ---
    const handleEdit = (user) => {
        setEditingUser(user);
        setEditData({
            nama: user.nama,
            email: user.email,
            role: user.role,
            studyProgramId: user.studyProgramId || '',
            kelas: user.kelas || ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/users/${editingUser.id}`, editData);
            alert('User berhasil diupdate!');
            setIsEditModalOpen(false);
            fetchUsers(); 
        } catch (err) { alert(err.response?.data?.msg || 'Gagal update.'); }
    };

    // --- HANDLER TAMBAH USER BARU ---
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/users/add', addData);
            alert('User baru berhasil ditambahkan!');
            setIsAddModalOpen(false);
            setAddData({ nama: '', npm: '', email: '', password: '', role: 'user', studyProgramId: '', kelas: '' }); // Reset form
            fetchUsers(); 
        } catch (err) { 
            alert(err.response?.data?.msg || 'Gagal menambah user.'); 
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Hapus user ini?')) return;
        try {
            await api.delete(`/api/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) { alert('Gagal hapus.'); }
    };

    const allPrograms = majors.flatMap(major => 
        major.StudyPrograms.map(program => ({
            id: program.id,
            name: `${program.name} (${major.name})`
        }))
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const handlePageChange = (page) => setCurrentPage(page);

    if (loading) return <div className="p-8 text-center text-gray-500">Memuat data...</div>;

    return (
        <div className={styles.pageContainer}>
            
            {/* ▼▼▼ MODAL TAMBAH USER ▼▼▼ */}
            {isAddModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Tambah User Baru</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className={styles.closeBtn}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddSubmit}>
                            <div><label className="text-sm font-semibold text-gray-600">Nama Lengkap</label><input type="text" value={addData.nama} onChange={(e) => setAddData({...addData, nama: e.target.value})} className={styles.inputField} required /></div>
                            <div><label className="text-sm font-semibold text-gray-600">NPM / NIP</label><input type="text" value={addData.npm} onChange={(e) => setAddData({...addData, npm: e.target.value})} className={styles.inputField} required /></div>
                            <div><label className="text-sm font-semibold text-gray-600">Email</label><input type="email" value={addData.email} onChange={(e) => setAddData({...addData, email: e.target.value})} className={styles.inputField} required /></div>
                            
                            {/* Input Password Khusus Tambah User */}
                            <div><label className="text-sm font-semibold text-gray-600">Password</label><input type="text" value={addData.password} onChange={(e) => setAddData({...addData, password: e.target.value})} className={styles.inputField} placeholder="Password awal" required /></div>
                            
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                                <div><label className="text-sm font-semibold text-gray-600">Kelas</label><input type="text" value={addData.kelas} onChange={(e) => setAddData({...addData, kelas: e.target.value})} className={styles.inputField} placeholder="Cth: 3A" /></div>
                                <div><label className="text-sm font-semibold text-gray-600">Role</label><select value={addData.role} onChange={(e) => setAddData({...addData, role: e.target.value})} className={styles.inputField} required><option value="user">User</option><option value="admin">Admin</option><option value="timdis">Timdis</option></select></div>
                            </div>
                            
                            <div><label className="text-sm font-semibold text-gray-600">Program Studi</label><select value={addData.studyProgramId} onChange={(e) => setAddData({...addData, studyProgramId: e.target.value})} className={styles.inputField}><option value="">-- Pilih Prodi --</option>{allPrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                            
                            <button type="submit" className={styles.submitBtn}>Tambah User</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDIT (Tetap Sama) */}
            {isEditModalOpen && editingUser && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Edit Pengguna</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className={styles.closeBtn}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div><label className="text-sm font-semibold text-gray-600">Nama Lengkap</label><input type="text" value={editData.nama} onChange={(e) => setEditData({...editData, nama: e.target.value})} className={styles.inputField} required /></div>
                            <div><label className="text-sm font-semibold text-gray-600">Email</label><input type="email" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} className={styles.inputField} required /></div>
                            <div><label className="text-sm font-semibold text-gray-600">Kelas</label><input type="text" value={editData.kelas} onChange={(e) => setEditData({...editData, kelas: e.target.value})} className={styles.inputField} /></div>
                            <div><label className="text-sm font-semibold text-gray-600">Prodi</label><select value={editData.studyProgramId} onChange={(e) => setEditData({...editData, studyProgramId: e.target.value})} className={styles.inputField}><option value="">-- Pilih --</option>{allPrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                            <div><label className="text-sm font-semibold text-gray-600">Role</label><select value={editData.role} onChange={(e) => setEditData({...editData, role: e.target.value})} className={styles.inputField} required><option value="user">User</option><option value="admin">Admin</option><option value="timdis">Timdis</option></select></div>
                            <button type="submit" className={styles.submitBtn}>Simpan Perubahan</button>
                        </form>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className={styles.headerSection}>
                <div className={styles.titleGroup}>
                    <Users size={32} />
                    <div><h1>Manajemen Pengguna</h1><p>Total {users.length} pengguna terdaftar</p></div>
                </div>
                
                <div style={{display:'flex', gap:'10px'}}>
                    {/* ▼▼▼ TOMBOL TAMBAH USER BARU ▼▼▼ */}
                    <button 
                        onClick={() => setIsAddModalOpen(true)} 
                        className={styles.refreshBtn} // Reuse style button
                        style={{backgroundColor: 'white', color: '#2196F3'}}
                    >
                        <Plus size={18} /> Tambah User
                    </button>

                    <button onClick={fetchUsers} disabled={refreshing} className={styles.refreshBtn}>
                        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>
            </div>

            {/* TABEL (Tetap Sama) */}
            <div className={styles.tableContainer}>
                <table className={styles.userTable}>
                    <thead>
                        <tr>
                            <th className={styles.tableHeader}>No</th>
                            <th className={styles.tableHeader}>Nama / Email</th>
                            <th className={styles.tableHeader}>Identitas</th>
                            <th className={styles.tableHeader}>Akademik</th>
                            <th className={styles.tableHeader}>Role</th>
                            <th className={styles.tableHeader}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user, index) => (
                            <tr key={user.id} className={styles.userTableRow}>
                                <td className={styles.tableCell}>{indexOfFirstItem + index + 1}</td>
                                <td className={styles.tableCell}>
                                    <div className="font-bold">{user.nama}</div>
                                    <div className={styles.infoSubtext}>{user.email}</div>
                                </td>
                                <td className={styles.tableCell}>
                                    <div className="font-medium">{user.npm}</div>
                                    <div className={styles.infoSubtext}>Kelas: {user.kelas || '-'}</div>
                                </td>
                                <td className={styles.tableCell}>
                                    <div className="font-medium">{user.studyProgramName}</div>
                                    <div className={styles.infoSubtext}>{user.majorName}</div>
                                </td>
                                <td className={styles.tableCell}>
                                    <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.roleAdmin : user.role === 'timdis' ? styles.roleTimdis : styles.roleUser}`}>{user.role}</span>
                                </td>
                                <td className={styles.tableCell}>
                                    <button onClick={() => handleEdit(user)} className={`${styles.actionBtn} ${styles.edit}`}><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(user.id)} className={`${styles.actionBtn} ${styles.delete}`}><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-500">Belum ada data.</td></tr>}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className={styles.paginationContainer}>
                        <button className={styles.pageBtn} onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft size={16} /></button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i + 1} onClick={() => handlePageChange(i + 1)} className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.active : ''}`}>{i + 1}</button>
                        ))}
                        <button className={styles.pageBtn} onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight size={16} /></button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;