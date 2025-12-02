// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Impor Layout & Komponen User
import Layout from './components/Layout'; 
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import HistoryUser from './components/HistoryUser'; 

// Admin Components
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminRoute from './components/admin/AdminRoute'; 
import UserManagement from './components/admin/UserManagement';
import AttendanceLog from './components/admin/AttendanceLog';
import MajorManagement from './components/admin/MajorManagement';
import DashboardAdmin from './components/admin/DashboardAdmin';
import AdminProfile from './components/admin/AdminProfile';

// Timdis Components (Pastikan import ini ada)
import TimdisLayout from './components/timdis/TimdisLayout';
import TimdisRoute from './components/timdis/TimdisRoute';
import DashboardTimdis from './components/timdis/DashboardTimdis';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* === RUTE USER === */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/absensi" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<HistoryUser />} />
        </Route>

        {/* === RUTE ADMIN === */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          {/* Perhatikan: Rute anak tidak perlu "/" di depan */}
          <Route index element={<DashboardAdmin />} /> 
          <Route path="majors" element={<MajorManagement />} />
          <Route path="rekap" element={<AttendanceLog />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route> {/* <--- PASTIKAN RUTE ADMIN DITUTUP DI SINI */}

        {/* === RUTE TIMDIS (SEJAJAR DENGAN ADMIN, BUKAN DI DALAMNYA) === */}
        <Route 
          path="/timdis" 
          element={
            <TimdisRoute>
              <TimdisLayout />
            </TimdisRoute>
          }
        >
          <Route index element={<DashboardTimdis />} />
          
          {/* Reuse Komponen Admin */}
          <Route path="majors" element={<MajorManagement />} />
          <Route path="rekap" element={<AttendanceLog />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;