import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import jwt_decode from 'jwt-decode';

import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [terrenos, setTerrenos] = useState([]);
  const navigate = useNavigate();

  // 🔹 Función para traer terrenos después del login
  const obtenerTerrenos = async (token) => {
    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? 'https://hackathoncontinental.grupo-digital-nextri.com/terrenos'
        : 'http://localhost:5000/terrenos';

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTerrenos(response.data.terrenos || []);
    } catch (error) {
      console.error("Error obteniendo terrenos:", error);
    }
  };

  // 🔹 Login normal con usuario y contraseña
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? 'https://hackathoncontinental.grupo-digital-nextri.com/login'
        : 'http://localhost:5000/login';

      const response = await axios.post(apiUrl, {
        correo: username,
        password: password,
      });

      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));

      await obtenerTerrenos(response.data.token);

      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.message || 'Hubo un error en el login');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Login con Google
  const handleGoogleLoginSuccess = async (response) => {
    setLoading(true);
    try {
      const { credential } = response;
      const userInfo = jwt_decode(credential);

      // Limpiar antes de guardar
      localStorage.removeItem('authToken');
      localStorage.removeItem('usuario');

      const apiUrl = process.env.NODE_ENV === 'production'
        ? 'https://hackathoncontinental.grupo-digital-nextri.com/auth'
        : 'http://localhost:5000/auth';

      const { data } = await axios.post(apiUrl, {
        google_id: userInfo.sub,
        nombre: userInfo.name,
        correo: userInfo.email,
        imagen_perfil: userInfo.picture,
      });

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      await obtenerTerrenos(data.token);

      navigate('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      setErrorMessage('Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginFailure = () => {
    setErrorMessage('Error al autenticar con Google');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>Hack UNCP</h1>
        
        <div>
          <label htmlFor="username">Correo</label>
          <input 
            type="email" 
            id="username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
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
            required 
          />
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Cargando...' : 'Iniciar sesión'}
        </button>

        <div className="google-login-container">
          <h1 className="or-text"> </h1>
          <GoogleLogin 
            onSuccess={handleGoogleLoginSuccess} 
            onError={handleGoogleLoginFailure}
            disabled={loading}
          />
        </div>
      </form>

      {terrenos.length > 0 && (
        <div className="terrenos-list">
          <h2>Terrenos disponibles:</h2>
          <ul>
            {terrenos.map((terreno) => (
              <li key={terreno.id}>
                {terreno.titulo} - {terreno.precio} USD
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Login;
