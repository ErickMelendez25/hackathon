import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios'; // Asegúrate de tener axios instalado
import '../styles/DashboardHeader.css';

const handleLogout = () => {
  // Eliminar el token y el rol del localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  // Redirigir al login
  window.location.href = '/';
};

function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [estudiantes, setEstudiantes] = useState([]); // Lista de estudiantes
  const [asesores, setAsesores] = useState([]); // Lista de estudiantes
  const [revisores, setRevisores] = useState([]); // Lista de estudiantes
  const location = useLocation();
  const [titleVisible, setTitleVisible] = useState(false);

  // Verifica si estamos en la página principal del dashboard
  const isDashboard = location.pathname === "/dashboard";
  
  // Obtener la opción actual desde la URL (si existe) y decodificarla
  const opcion = location.pathname.split('/')[2];
  
  // Decodificar la URL y reemplazar los guiones por espacios
  const decodedTitle = opcion ? decodeURIComponent(opcion.replaceAll('-', ' ')) : ''; 

  // Función para abrir o cerrar el menú
  const toggleMenu = () => {
    setIsMenuOpen(prevState => !prevState);
  };

  // Función para confirmar el cierre de sesión
  const confirmLogout = () => {
    setShowConfirmLogout(true);
    setIsMenuOpen(false);
  };

  // Función para confirmar realmente el logout
  const confirmAndLogout = () => {
    handleLogout();
  };

  // Función para cancelar el logout
  const cancelLogout = () => {
    setShowConfirmLogout(false);
  };

  // Cuando el pathname cambia, hacemos aparecer el título con una transición
  useEffect(() => {
    setTitleVisible(false); // Primero ocultamos el título
    const timer = setTimeout(() => {
      setTitleVisible(true); // Mostramos el título después de un tiempo
    }, 100); // Tiempo en ms para que se vea el efecto de transición
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Obtener el rol del usuario desde el localStorage
  const userRole = localStorage.getItem('userRole');

  // Obtener el usuario logueado desde el localStorage
  const user = JSON.parse(localStorage.getItem('usuario'));
  const userEmail = user ? user.correo : '';  // Correo del usuario logueado
  const userRol = user ? user.rol : '';  // Correo del usuario logueado


  // Obtener el nombre completo del estudiante
  let Nombre = '';
  
  // Condicional para determinar qué nombre mostrar dependiendo del rol
  if (userRol === 'estudiante') {
      // Obtener los estudiantes desde la API
    useEffect(() => {
      const fetchEstudiantes = async () => {
        try {
          const response = await axios.get('https://sateliterrreno-production.up.railway.app/api/estudiantes');
          console.log("Estudiantes recibidos: ", response.data);  // Verifica que los estudiantes están bien cargados
          setEstudiantes(response.data);
        } catch (error) {
          console.error('Error al obtener estudiantes:', error);
        }
      };

      fetchEstudiantes();
    }, []); // Este efecto se ejecuta solo una vez cuando el componente se monta

    // Filtrar el estudiante basado en el correo del usuario logueado
    const estudiante = estudiantes.find((item) => item.correo === userEmail);

    // Verificar en consola si encontramos el estudiante correctamente
    console.log("Estudiante filtrado: ", estudiante);

    Nombre = estudiante ? `${estudiante.nombres} ${estudiante.apellido_paterno.charAt(0)}. ${estudiante.apellido_materno.charAt(0)}.` : '';
  
  } else if (userRol === 'asesor') {
    useEffect(() => {
      const fetchAsesores = async () => {
        try {
          const response = await axios.get('https://sateliterrreno-production.up.railway.app/api/asesores');
          console.log("Asesores recibidos: ", response.data);  // Verifica que los estudiantes están bien cargados
          setAsesores(response.data);
        } catch (error) {
          console.error('Error al obtener asesores:', error);
        }
      };

      fetchAsesores();
    }, []); // Este efecto se ejecuta solo una vez cuando el componente se monta

    const asesor = asesores.find((item) => item.correo === userEmail);
    console.log("asesor filtrado: ", asesor);
    Nombre = asesor ? `${asesor.nombre_asesor} ${asesor.apellido_paterno} ${asesor.apellido_materno}` : '';

  } else if (userRol === 'revisor') {
    useEffect(() => {
      const fetchRevisores = async () => {
        try {
          const response = await axios.get('https://sateliterrreno-production.up.railway.app/api/revisores');
          console.log("Revisores recibidos: ", response.data);  // Verifica que los estudiantes están bien cargados
          setRevisores(response.data);
        } catch (error) {
          console.error('Error al obtener revisores:', error);
        }
      };

      fetchRevisores();
    }, []); // Este efecto se ejecuta solo una vez cuando el componente se monta

    const revisor = revisores.find((item) => item.correo === userEmail);
    console.log("revisor filtrado: ", revisor);
    Nombre = revisor ? `${revisor.nombre_revisor} ${revisor.apellido_paterno} ${revisor.apellido_materno}` : '';
  }

  return (
    <header className="dashboard-header">
      <div className="logo-container">
        <Link to="/dashboard" className="logo-link">
          <img src="/images/logo.png" alt="Logo de CampusUC" className={titleVisible ? 'logo-animate' : ''} />
        </Link>
        <Link to="/dashboard" className="logo-link">
          <img src="/images/sist.png" alt="Logo Sist" className={titleVisible ? 'logo-animate' : ''} />
        </Link>
      </div>



      {/* Mostrar el título de la opción seleccionada o el menú, dependiendo de la ruta */}
      <div className="header-center">
        {decodedTitle ? (
          <h1 className={titleVisible ? 'title-animate' : ''}>
            {decodedTitle.toUpperCase()}
          </h1>
        ) : (
          isDashboard && (
            <div className="navbar-container">
              <nav className="navbar">
                <ul className="header-options">
                  <li><Link to="/dashboard/Direccionamiento-Estratégico" className="nav-item">Direccionamiento Estratégico</Link></li>
                  <li><Link to="/dashboard/Gestión-para-Organizaciones-educativas" className="nav-item">Gestión para Organizaciones educativas</Link></li>
                  <li><Link to="/dashboard/Responsabilidad-Social" className="nav-item">Responsabilidad Social</Link></li>
                  <li><Link to="/dashboard/Sostenibilidad-Ambiental" className="nav-item">Sostenibilidad Ambiental</Link></li>
                </ul>
              </nav>
            </div>
          )
        )}
      </div>

      {/* Ícono de usuario */}
      <div className="user-icon-container">
        <img 
          src="/images/inge.jpg" 
          alt="Icono de usuario" 
          className="user-icon" 
          onClick={toggleMenu} 
          title="Opciones" 
        />
        {/* Mostrar el correo y nombre del usuario después del logo */}
        {userEmail && (
          <div className="user-info">
      
            <p><strong> {userRol.toUpperCase()}</strong></p>
            {Nombre ? (
              <p><strong> {Nombre}</strong></p>
            ) : (
              <p><strong></strong></p>
            )}
            <p><strong>{userEmail}</strong> </p>
          </div>
        )}

        {isMenuOpen && (
          <div className="menu-options">
            <ul>
              <li onClick={confirmLogout}>Cerrar sesión</li>
            </ul>
          </div>
        )}
      </div>

      {/* Mostrar el rol del usuario al costado del menú de opciones */}
      <div className="user-role" style={{ float: 'right', marginTop: '10px', fontSize: '16px' }}>
        <label>{userRole ? `Rol: ${userRole}` : userRole}</label>
      </div>

      {/* Modal de confirmación de cierre de sesión */}
      {showConfirmLogout && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>¿Estás seguro que deseas cerrar sesión?</h2>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={cancelLogout}>Cancelar</button>
              <button className="btn-confirm" onClick={confirmAndLogout}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default DashboardHeader;
