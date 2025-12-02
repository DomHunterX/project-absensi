// src/components/admin/MajorManagement.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'; 
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet'; 
import { 
    MapPin, 
    Plus, 
    Trash2, 
    Edit3, 
    Building, 
    BookOpen, 
    X, 
    Check 
} from 'lucide-react';
import styles from './MajorManagement.module.css';

const BASE_URL = 'http://localhost:5000';

// Konfigurasi Icon Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- KOMPONEN MAP PICKER (MODAL) ---
const MapPickerModal = ({ initialLat, initialLng, onClose, onSave }) => {
    const defaultPosition = initialLat && initialLng ? [initialLat, initialLng] : [-5.376867, 105.2533893];
    const [currentMarker, setCurrentMarker] = useState(defaultPosition);

    const MapEvents = () => {
        useMapEvents({
            click: (e) => {
                setCurrentMarker([e.latlng.lat, e.latlng.lng]);
            },
        });
        return null;
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.mapModal}>
                <div className={styles.mapHeader}>
                    <h3>Pilih Lokasi Absensi</h3>
                    <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
                </div>
                <div className={styles.mapContainer}>
                    <MapContainer 
                        center={defaultPosition} 
                        zoom={16} 
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap'
                        />
                        <MapEvents />
                        <Marker position={currentMarker} />
                    </MapContainer>
                </div>
                <div className={styles.mapFooter}>
                    <div style={{ marginRight: 'auto', fontSize: '0.85rem', color: '#64748b' }}>
                        Lat: {currentMarker[0].toFixed(5)}, Lng: {currentMarker[1].toFixed(5)}
                    </div>
                    <button onClick={onClose} className={styles.btnCancel}>Batal</button>
                    <button 
                        onClick={() => onSave(currentMarker[0], currentMarker[1])} 
                        className={styles.btnSave}
                    >
                        Simpan Lokasi
                    </button>
                </div>
            </div>
        </div>
    );
};

const MajorManagement = () => {
    const [majors, setMajors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // UI States
    const [activeForm, setActiveForm] = useState(null); // 'major' | 'program' | null
    const [isMapOpen, setIsMapOpen] = useState(false);
    
    // Major Form Data
    const [majorIdToEdit, setMajorIdToEdit] = useState(null); 
    const [majorName, setMajorName] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [radius, setRadius] = useState('50'); 
    
    // Program Form Data
    const [programName, setProgramName] = useState('');
    const [selectedMajorId, setSelectedMajorId] = useState('');

    const token = localStorage.getItem('token');
    const api = axios.create({
        baseURL: BASE_URL,
        headers: { 'Authorization': `Bearer ${token}` }
    });

    useEffect(() => {
        fetchMajors();
    }, []);

    const fetchMajors = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/majors/all');
            setMajors(res.data);
        } catch (err) {
            setError('Gagal memuat data.');
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS JURUSAN ---
    const openMajorForm = (major = null) => {
        if (major) {
            setMajorIdToEdit(major.id);
            setMajorName(major.name);
            setLatitude(major.latitude);
            setLongitude(major.longitude);
            setRadius(major.radius);
        } else {
            resetMajorForm();
        }
        setActiveForm('major');
    };

    const resetMajorForm = () => {
        setMajorIdToEdit(null);
        setMajorName('');
        setLatitude('');
        setLongitude('');
        setRadius('50');
    };

    const handleSaveMajor = async (e) => {
        e.preventDefault();
        const payload = {
            name: majorName,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radius: parseInt(radius)
        };
        
        try {
            if (majorIdToEdit) {
                await api.put(`/api/majors/major/${majorIdToEdit}`, payload);
            } else {
                await api.post('/api/majors/major', payload);
            }
            alert(`Jurusan berhasil ${majorIdToEdit ? 'diperbarui' : 'ditambahkan'}!`);
            setActiveForm(null);
            resetMajorForm();
            fetchMajors();
        } catch (err) {
            alert(err.response?.data?.msg || 'Gagal menyimpan Jurusan.');
        }
    };

    const handleDeleteMajor = async (id, name) => {
        if (!window.confirm(`Hapus Jurusan ${name} dan semua Prodinya?`)) return;
        try {
            await api.delete(`/api/majors/major/${id}`);
            fetchMajors();
        } catch (err) {
            alert(err.response?.data?.msg || 'Gagal menghapus.');
        }
    };

    // --- HANDLERS PRODI ---
    const openProgramForm = (majorId = '') => {
        setSelectedMajorId(majorId);
        setProgramName('');
        setActiveForm('program');
    };

    const handleSaveProgram = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/majors/program', { name: programName, majorId: selectedMajorId });
            alert('Program Studi berhasil ditambahkan!');
            setProgramName('');
            setActiveForm(null);
            fetchMajors();
        } catch (err) {
            alert(err.response?.data?.msg || 'Gagal menambahkan Prodi.');
        }
    };

    const handleDeleteProgram = async (id, name) => {
        if (!window.confirm(`Hapus Prodi ${name}?`)) return;
        try {
            await api.delete(`/api/majors/program/${id}`);
            fetchMajors();
        } catch (err) {
            alert(err.response?.data?.msg || 'Gagal menghapus Prodi.');
        }
    };

    // --- RENDER ---

    if (loading) return <div className="p-8 text-center text-gray-500">Memuat data...</div>;

    return (
        <div className={styles.pageContainer}>
            
            {/* MAP MODAL */}
            {isMapOpen && (
                <MapPickerModal
                    initialLat={parseFloat(latitude)}
                    initialLng={parseFloat(longitude)}
                    onClose={() => setIsMapOpen(false)}
                    onSave={(lat, lng) => {
                        setLatitude(lat);
                        setLongitude(lng);
                        setIsMapOpen(false);
                    }}
                />
            )}

            {/* HEADER */}
            <div className={styles.headerSection}>
                <div className={styles.titleGroup}>
                    <h1><Building size={32} /> Manajemen Jurusan</h1>
                    <p>Kelola data Jurusan, Program Studi, dan Lokasi Absensi</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.btnAdd} onClick={() => openMajorForm()}>
                        <Plus size={18} /> Tambah Jurusan
                    </button>
                    <button className={styles.btnAdd} onClick={() => openProgramForm()}>
                        <Plus size={18} /> Tambah Prodi
                    </button>
                </div>
            </div>

            {/* FORM INPUT JURUSAN */}
            {activeForm === 'major' && (
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <h3>{majorIdToEdit ? 'Edit Data Jurusan' : 'Tambah Jurusan Baru'}</h3>
                        <button onClick={() => setActiveForm(null)} className={styles.closeBtn}><X size={20}/></button>
                    </div>
                    <form onSubmit={handleSaveMajor} className={styles.formGrid}>
                        <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                            <label>Nama Jurusan</label>
                            <input 
                                className={styles.inputField}
                                type="text" 
                                value={majorName} 
                                onChange={(e) => setMajorName(e.target.value)} 
                                placeholder="Contoh: Teknologi Informasi"
                                required 
                                // Jika edit, nama tidak boleh diubah (sesuai logika backend sebelumnya, opsional)
                                // disabled={majorIdToEdit !== null} 
                            />
                        </div>
                        
                        <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                            <label>Lokasi (Lat, Lng)</label>
                            <div className={styles.mapPreviewGroup}>
                                <input 
                                    className={styles.inputField} 
                                    style={{ flex: 1 }}
                                    value={`${latitude || ''}, ${longitude || ''}`} 
                                    readOnly 
                                    placeholder="Pilih lokasi via peta..."
                                />
                                <button type="button" onClick={() => setIsMapOpen(true)} className={styles.btnMap} title="Buka Peta">
                                    <MapPin size={20} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Radius (Meter)</label>
                            <input 
                                className={styles.inputField}
                                type="number" 
                                value={radius} 
                                onChange={(e) => setRadius(e.target.value)} 
                                required 
                            />
                        </div>

                        <div className={styles.inputGroup} style={{ justifyContent: 'flex-end' }}>
                            <button type="submit" className={styles.btnSubmit}>
                                <Check size={18} style={{marginRight: 8}}/> Simpan
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* FORM INPUT PRODI */}
            {activeForm === 'program' && (
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <h3>Tambah Program Studi</h3>
                        <button onClick={() => setActiveForm(null)} className={styles.closeBtn}><X size={20}/></button>
                    </div>
                    <form onSubmit={handleSaveProgram} className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                            <label>Pilih Jurusan Induk</label>
                            <select 
                                className={styles.selectField}
                                value={selectedMajorId} 
                                onChange={(e) => setSelectedMajorId(e.target.value)} 
                                required
                            >
                                <option value="">-- Pilih Jurusan --</option>
                                {majors.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Nama Program Studi</label>
                            <input 
                                className={styles.inputField}
                                type="text" 
                                value={programName} 
                                onChange={(e) => setProgramName(e.target.value)} 
                                placeholder="Contoh: TRPL"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup} style={{ justifyContent: 'flex-end' }}>
                            <button type="submit" className={styles.btnSubmit}>
                                <Check size={18} style={{marginRight: 8}}/> Tambah Prodi
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* LIST JURUSAN (GRID CARDS) */}
            <div className={styles.majorsGrid}>
                {majors.map(major => (
                    <div key={major.id} className={styles.majorCard}>
                        {/* Card Header: Info Jurusan */}
                        <div className={styles.cardHeader}>
                            <div style={{display:'flex'}}>
                                <div className={styles.majorIconWrapper}>
                                    <Building size={24} />
                                </div>
                                <div className={styles.majorInfo}>
                                    <h3>{major.name}</h3>
                                    <div className={styles.locationBadge}>
                                        <MapPin size={12} />
                                        Radius: {major.radius}m
                                    </div>
                                </div>
                            </div>
                            <div className={styles.cardActions}>
                                <button 
                                    className={`${styles.actionIconBtn} ${styles.edit}`}
                                    onClick={() => openMajorForm(major)}
                                    title="Edit Lokasi"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button 
                                    className={`${styles.actionIconBtn} ${styles.delete}`} 
                                    onClick={() => handleDeleteMajor(major.id, major.name)}
                                    title="Hapus Jurusan"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Card Body: List Prodi */}
                        <div className={styles.cardBody}>
                            <div className={styles.programListHeader}>
                                Program Studi ({major.StudyPrograms.length})
                            </div>
                            
                            <div className={styles.programTags}>
                                {major.StudyPrograms.length > 0 ? (
                                    major.StudyPrograms.map(prog => (
                                        <div key={prog.id} className={styles.programTag}>
                                            <BookOpen size={14} className="text-blue-400"/>
                                            {prog.name}
                                            <button 
                                                className={styles.deleteProgBtn}
                                                onClick={() => handleDeleteProgram(prog.id, prog.name)}
                                                title="Hapus Prodi"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.emptyPrograms}>Belum ada Program Studi</div>
                                )}
                                
                                {/* Tombol Quick Add Prodi */}
                                <button 
                                    className={styles.programTag} 
                                    style={{ borderStyle: 'dashed', cursor: 'pointer', color: '#2196F3' }}
                                    onClick={() => openProgramForm(major.id)}
                                >
                                    <Plus size={14} /> Add
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {majors.length === 0 && !loading && (
                <div style={{ textAlign: 'center', marginTop: '4rem', color: '#94a3b8' }}>
                    <Building size={48} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                    <p>Belum ada data jurusan. Silakan tambah data baru.</p>
                </div>
            )}
        </div>
    );
};

export default MajorManagement;