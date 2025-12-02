import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/admin/login" />;
    }

    try {
        const decodedToken = jwtDecode(token);

        // ▼▼▼ TAMBAHKAN BARIS INI UNTUK DEBUGGING ▼▼▼
        console.log('Isi Token:', decodedToken); 

        // Periksa apakah rolenya adalah 'admin'
        if (decodedToken.user.role !== 'admin' && decodedToken.user.role !== 'timdis') {
            alert('Akses ditolak. Anda bukan admin/timdis.');
            return <Navigate to="/login" />;
        }
        return children;
    } catch (error) {
        console.error("Token tidak valid:", error);
        return <Navigate to="/admin/login" />;
    }
};

export default AdminRoute;