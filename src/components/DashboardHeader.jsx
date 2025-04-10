import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Importamos useNavigate para redirección
import '../styles/DashboardHeader.css';

const handleLogout = (navigate) => {
  // Eliminar el token y el rol del localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('usuario');  // Limpiar también los datos del usuario
  localStorage.removeItem('user'); // Limpiar los datos de Google del usuario
  // Redirigir al login
  navigate('/'); // Usamos navigate para redirigir a la página de login
};

function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState(''); // Estado para la foto de perfil del usuario
  const [userName, setUserName] = useState(''); // Estado para el nombre del usuario
  const location = useLocation();
  const navigate = useNavigate(); // Usamos navigate para redirigir

  // Verifica si estamos en la página principal del dashboard
  const isDashboard = location.pathname === "/dashboard";

  // Obtener la opción actual desde la URL (si existe) y decodificarla
  const opcion = location.pathname.split('/')[2];
  const decodedTitle = opcion ? decodeURIComponent(opcion.replaceAll('-', ' ')) : ''; 

  // Función para abrir o cerrar el menú
  const toggleMenu = () => {
    setIsMenuOpen(prevState => !prevState);
  };

  // Función para confirmar el cierre de sesión
  const confirmLogout = () => {
    setIsMenuOpen(false); // Cerrar el menú antes de hacer el logout
    handleLogout(navigate); // Llamar a la función de logout y redirigir
  };

  // Obtener datos de Google si el usuario está logueado con Google
  useEffect(() => {
    const googleUser = localStorage.getItem('user');
    if (googleUser) {
      const googleData = JSON.parse(googleUser);
      setUserPhoto(googleData.imagen_perfil || ''); // Asignar la URL de la imagen de perfil, si existe
      setUserName(googleData.nombre); // Establecer el nombre del usuario
    }
  }, []); // Esta dependencia vacía asegura que se ejecute solo al montar el componente

  // Verifica que la URL de la imagen esté válida antes de asignarla
  const imageUrl = userPhoto || ''; // Imagen predeterminada en caso de no tener foto

  return (
    <header className="dashboard-header">
      <div className="logo-container">
        <Link to="/dashboard" className="logo-link">
          <img src="https://sateliterrreno-production.up.railway.app/terrenos/logo.png" alt="Logo" />
        </Link>
      </div>

      {/* Mostrar el título de la opción seleccionada o el menú, dependiendo de la ruta */}
      <div className="header-center">
        {decodedTitle ? (
          <h1>{decodedTitle.toUpperCase()}</h1>
        ) : (
          isDashboard && (
            <div className="navbar-container">
              <nav className="navbar">
                <ul className="header-options">
                  <li><span>Bienvenido, {userName || 'Usuario'}</span></li> {/* Mostrar el nombre del usuario */}
                </ul>
              </nav>
            </div>
          )
        )}
      </div>

      {/* Mostrar la imagen de perfil de usuario autenticado de Google */}
      <div className="user-photo-container">
        <img 
          src={imageUrl} // Foto de perfil de Google o la predeterminada
          alt="Foto de usuario"
          className="user-icon"
          onClick={toggleMenu} 
          title="Opciones" 
        />
        
        {/* Mostrar el menú de opciones cuando se hace clic en la foto */}
        {isMenuOpen && (
          <div className={`menu-options ${isMenuOpen ? 'show' : ''}`}>
              <ul>
                  <li onClick={confirmLogout}>Cerrar sesión</li>
              </ul>
          </div>
        )}
      </div>
    </header>
  );
}

export default DashboardHeader;
