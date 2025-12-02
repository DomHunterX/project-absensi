import React, { useState } from 'react';
import { useNavigate, } from 'react-router-dom';
import axios from 'axios'; 
import styles from './AdminLogin.module.css'
import PolinelaLogo from '../../assets/images/polinela-logo.png'
import { Eye, EyeOff } from 'lucide-react'; 

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Reset error setiap kali submit

        try {
            // Kita akan gunakan endpoint login yang sama, tapi nanti kita bisa bedakan rolenya
            const res = await axios.post('https://absensi-polinela.site/api/auth/login', {
                email,
                password,
            });

            // Simpan token dan arahkan ke dashboard admin
            localStorage.setItem('token', res.data.token);
            const role = res.data.user.role;
            if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'timdis') {
                navigate('/timdis');
            } else {
                setError('Anda tidak memiliki akses ke panel ini.');
                localStorage.removeItem('token');
            }

        } catch (err) {
            const message = err.response?.data?.msg || 'Login gagal. Periksa kembali email dan password.';
            setError(message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <img src={PolinelaLogo} alt="Logo Polinela" className="polinela-logo" />
                    <h1 className="app-title">Admin Login</h1>
                    <p className="app-subtitle">Masukan email dan password yang benar</p>
                </div>
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Masukkan email atau username"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type="password"
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
                    {error && <p className="form-error">{error}</p>}
                    <div className="form-actions">
                        <button type="submit" className="login-button">Login</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;