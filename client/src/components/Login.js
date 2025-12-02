// src/components/Login.js (Versi Final yang Benar untuk USER)

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Pastikan CSS ini terhubung

// Impor logo Anda
// Pastikan path ini benar: src/assets/images/polinela-logo.png
import PolinelaLogo from '../assets/images/polinela-logo.png'; 

// Impor ikon mata (pastikan 'npm install lucide-react')
import { Eye, EyeOff } from 'lucide-react'; 

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    
    // Ini adalah URL backend Anda dari file asli
    const BASE_URL = 'https://absensi-polinela.site';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); 

        try {
            const res = await axios.post(`${BASE_URL}/api/auth/login`, {
                email,
                password
            });

            // LOGIKA YANG BENAR:
            // Cek apakah peran yang login adalah 'user'.
            if (res.data.user.role !== 'user') {
                setError('Login admin harus melalui halaman login admin.');
                return; // Hentikan proses
            }

            // Jika lolos, simpan token dan arahkan ke dashboard user
            localStorage.setItem('token', res.data.token);
            navigate('/absensi'); // Path '/' mengarah ke Dashboard User

        } catch (err) {
            setError(err.response?.data?.msg || 'Login gagal. Cek kembali email/password Anda.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <img src={PolinelaLogo} alt="Logo Polinela" className="polinela-logo" />
                    <h1 className="app-title">Aplikasi Absensi Apel Polinela</h1>
                    <p className="app-subtitle">Masukan email dan password yang benar</p>
                </div>
                
                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">EMAIL</label>
                        <input
                            type="text" 
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Masukkan email atau username"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">PASSWORD</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                                required
                            />
                            <span 
                                className="toggle-password" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>
                    </div>
                    <button type="submit" className="login-button">
                        Masuk
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;