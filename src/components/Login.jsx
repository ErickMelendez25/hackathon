import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import jwt_decode from 'jwt-decode';

import '../styles/Login.css';







const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // Estado para manejar la carga
  const [terrenos, setTerrenos] = useState([]); // Estado para manejar los terrenos
  const navigate = useNavigate();



  const handleLogin = async (e) => {
    e.preventDefault();

    // Agregar los console.log aquí para depurar los valores de usuario y contraseña
    console.log("Correo:", username);  // Muestra el correo ingresado
    console.log("Contraseña:", password);  // Muestra la contraseña ingresada

    try {
      // Verifica si estás en producción (Railway) o en desarrollo (localhost)
      const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://sateliterrreno-production.up.railway.app/login' 
      : 'http://localhost:5000/login';

      console.log("API URL:", apiUrl);  // Verifica si la URL es correcta

      const response = await axios.post(apiUrl, {
        correo: username,
        password: password,
      });

      // Guarda el token y usuario en localStorage
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));

      // Obtener los terrenos después del login
      await obtenerTerrenos(response.data.token); // Llamada a obtener los terrenos

      // Redirigir al dashboard después de obtener los terrenos
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Hubo un error en el login');
    }
  };

  // Función para obtener la lista de terrenos
  const obtenerTerrenos = async (token) => {
    try {
      // Verifica si estás en producción (Railway) o en desarrollo (localhost)
      const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://sateliterrreno-production.up.railway.app/api/terrenos' 
      : 'http://localhost:5173/api/terrenos';

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTerrenos(response.data); // Guarda los terrenos en el estado
      console.log('Terrenos obtenidos:', response.data); // Depuración
    } catch (error) {
      console.error('Error al obtener terrenos:', error);
      setErrorMessage('Hubo un error al obtener los terrenos');
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    setLoading(true);
    console.log('Google login success response:', response);
  
    try {
      const { credential } = response;
      const userInfo = jwt_decode(credential);
      console.log('Información del usuario decodificada:', userInfo);
  
      // Limpiar localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('usuario');
      console.log('LocalStorage limpio');
  
      // URL directa al endpoint sin "/api"
      const apiUrl = process.env.NODE_ENV === 'production'
        ? 'https://sateliterrreno-production.up.railway.app'
        : 'http://localhost:5000';
  
      // Enviar datos al backend
      console.log('Enviando datos de autenticación al backend...');
      const { data } = await axios.post(`${apiUrl}/auth`, {
        google_id: userInfo.sub,
        nombre: userInfo.name,
        correo: userInfo.email, // Correcto según tu backend
        imagen_perfil: userInfo.picture,
      });
  
      console.log('Respuesta del servidor:', data);
  
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      console.log('Datos guardados en localStorage');
  
      setLoading(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      setLoading(false);
      setErrorMessage('Error al iniciar sesión con Google');
    }
  };
  
  
  
  
  

  const handleGoogleLoginFailure = (error) => {
    setErrorMessage('Error al iniciar sesión con Google');
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>Satélite Perú</h1>
        
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

        <button type="submit" className="login-button" disabled={loading}> {/* Deshabilitar si está cargando */}
          {loading ? 'Cargando...' : 'Iniciar sesión'}
        </button>

        <div className="google-login-container">
          <h1 className="or-text"> </h1>
          <GoogleLogin 
            onSuccess={handleGoogleLoginSuccess} 
            onError={handleGoogleLoginFailure}
            disabled={loading} // Deshabilitar si está cargando
          />
        </div>
      </form>

      {/* Muestra la lista de terrenos si están disponibles */}
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
