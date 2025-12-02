import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const TimdisRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/admin/login" />;
    }

    try {
        const decodedToken = jwtDecode(token);
        // Izinkan jika role adalah 'timdis' (atau admin juga boleh ngintip)
        if (decodedToken.user.role !== 'timdis' && decodedToken.user.role !== 'admin') {
            alert('Akses ditolak. Panel ini khusus Tim Disiplin.');
            return <Navigate to="/login" />;
        }
        return children;
    } catch (error) {
        localStorage.removeItem('token');
        return <Navigate to="/admin/login" />;
    }
};

export default TimdisRoute;