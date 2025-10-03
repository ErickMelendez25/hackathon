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
  const navigate = useNavigate();

  // Función de login normal
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://hackathoncontinental.grupo-digital-nextri.com/login'
          : 'http://localhost:5000/login';

      const response = await axios.post(apiUrl, {
        correo: username,
        password: password,
      });

      // Guardar token siempre
      localStorage.setItem('authToken', response.data.token);

      // ✅ Guardar usuario solo si existe
      if (response.data.usuario) {
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      } else {
        localStorage.removeItem('usuario');
      }

      setLoading(false);
      navigate('/dashboard');
    } catch (error) {
      console.error("Error en login:", error);
      setErrorMessage(error.response?.data?.message || 'Hubo un error en el login');
      setLoading(false);
    }
  };

  // Login con Google
  const handleGoogleLoginSuccess = async (response) => {
    setLoading(true);
    try {
      const { credential } = response;
      const userInfo = jwt_decode(credential);

      const apiUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://hackathoncontinental.grupo-digital-nextri.com'
          : 'http://localhost:5000';

      const { data } = await axios.post(`${apiUrl}/auth`, {
        google_id: userInfo.sub,
        nombre: userInfo.name,
        correo: userInfo.email,
        imagen_perfil: userInfo.picture,
      });

      // Guardar token siempre
      localStorage.setItem('authToken', data.token);

      // ✅ Guardar usuario solo si existe
      if (data.usuario) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
      } else {
        localStorage.removeItem('usuario');
      }

      setLoading(false);
      navigate('/dashboard');
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      setErrorMessage(error.response?.data?.message || 'Error al iniciar sesión con Google');
      setLoading(false);
    }
  };

  const handleGoogleLoginFailure = (error) => {
    console.error("Error Google Login:", error);
    setErrorMessage('Error al iniciar sesión con Google');
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
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
            disabled={loading}
          />
        </div>
      </form>
    </div>
  );
};

export default Login;
