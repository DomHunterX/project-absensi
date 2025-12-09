import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import styles from './NotificationBell.module.css'; // Buat CSS simple nanti

const NotificationBell = () => {
    const [notifs, setNotifs] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const token = localStorage.getItem('token');

    const fetchNotifs = async () => {
        try {
            const res = await axios.get('https://absensi-polinela.site/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifs(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchNotifs();
        // Polling setiap 1 menit (Opsional)
        const interval = setInterval(fetchNotifs, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleRead = async (id) => {
        try {
            await axios.put(`https://absensi-polinela.site/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update UI lokal
            setNotifs(notifs.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) { console.error(err); }
    };

    return (
        <div className={styles.container} ref={menuRef}> {/* Tambah ref buat klik outside kalo mau */}
            
            <div className={styles.iconWrapper} onClick={() => setIsOpen(!isOpen)}>
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </div>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <span>Notifikasi</span>
                        {unreadCount > 0 && (
                            <span style={{fontSize:'0.75rem', color:'#2196F3', cursor:'pointer'}} onClick={markAllRead}>
                                Tandai semua dibaca
                            </span>
                        )}
                    </div>
                    
                    <div className={styles.list}>
                        {notifs.length === 0 ? (
                            <div className={styles.empty}>
                                <Bell size={32} color="#e2e8f0" />
                                <span>Tidak ada notifikasi baru</span>
                            </div>
                        ) : (
                            notifs.map(n => (
                                <div 
                                    key={n.id} 
                                    onClick={() => handleRead(n.id)}
                                    className={`${styles.item} ${n.isRead ? styles.read : styles.unread}`}
                                >
                                    <div className={styles.time}>
                                        {new Date(n.createdAt).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'
                                        })}
                                    </div>
                                    <div className={styles.title}>{n.title}</div>
                                    <div className={styles.message}>{n.message}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;