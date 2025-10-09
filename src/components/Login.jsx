// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import jwt_decode from 'jwt-decode';
import '../styles/Login.css';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔑 URL del backend desde Vite
  const apiBase = import.meta.env.VITE_API_URL;

  // 📩 LOGIN CON USUARIO Y CONTRASEÑA
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(`${apiBase}/login`, {
        correo,
        password,
      });

      // Guardar token y usuario
      localStorage.setItem('authToken', response.data.token);
      if (response.data.usuario) {
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error en login:', error);
      setErrorMessage(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // 🌐 LOGIN CON GOOGLE
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const userInfo = jwt_decode(credentialResponse.credential);

      const response = await axios.post(`${apiBase}/auth`, {
        google_id: userInfo.sub,
        nombre: userInfo.name,
        correo: userInfo.email,
        imagen_perfil: userInfo.picture,
      });

      // Guardar token y usuario
      localStorage.setItem('authToken', response.data.token);
      if (response.data.usuario) {
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error Google Login:', error);
      setErrorMessage(error.response?.data?.message || 'Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginFailure = (error) => {
    console.error('Error Google Login:', error);
    setErrorMessage('Error al iniciar sesión con Google');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>Hack UNCP</h1>

        <div>
          <label htmlFor="correo">Correo</label>
          <input
            type="email"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="ejemplo@continental.edu.pe"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Cargando...' : 'Iniciar sesión'}
        </button>

        <div className="google-login-container">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
            useOneTap
          />
        </div>
      </form>
    </div>
  );
};

export default Login;
