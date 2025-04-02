import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/DashboardTerrenos.css";  // Asegúrate de tener un archivo de estilos

const DashboardMain = () => {
  const [terrenos, setTerrenos] = useState([]);  // Guardamos los terrenos
  const [loading, setLoading] = useState(true);  // Para controlar si estamos cargando
  const [error, setError] = useState(null);  // Para manejar los errores

  // API URL dependiendo si estamos en desarrollo o producción
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://sateliterrreno-production.up.railway.app' 
    : 'http://localhost:5000';

  // useEffect para obtener los terrenos
  useEffect(() => {
    console.log("Iniciando la solicitud para obtener terrenos...");
    
    const token = localStorage.getItem('authToken');  // Obtener el token de autenticación
    console.log("Token recuperado del localStorage:", token);

    if (!token) {
      setError('Token de autenticación no encontrado');
      console.error("No se encontró el token de autenticación.");
      setLoading(false);
      return;
    }

    // Llamada GET para obtener los terrenos
    console.log("Realizando la solicitud GET para obtener terrenos...");
    axios.get(`${apiUrl}/api/terrenos`, {
      headers: {
        Authorization: `Bearer ${token}`,  // Enviar el token de autenticación
      },
    })
    .then(response => {
      console.log("Respuesta de la API (terrenos obtenidos):", response);
      console.log("Datos de terrenos:", response.data);  // Mostrar los terrenos obtenidos
      setTerrenos(response.data);  // Guardamos los terrenos en el estado
      setLoading(false);  // Ya no estamos cargando
    })
    .catch(error => {
      setError('Error al obtener terrenos');
      setLoading(false);  // Ya no estamos cargando
      console.error('Error al obtener terrenos:', error.response?.data || error.message);
    });
  }, [apiUrl]);  // Solo se ejecuta una vez cuando el componente se monta

  // Mientras estamos cargando, mostramos un mensaje de loading
  if (loading) {
    console.log("Cargando terrenos...");
    return <div>Cargando terrenos...</div>;
  }

  // Si ocurrió un error, mostramos el mensaje de error
  if (error) {
    console.error("Error en la carga de terrenos:", error);
    return <div>{error}</div>;
  }

  return (
    <div className="dashboard">
      <h2>Lista de Terrenos</h2>

      {/* Si hay terrenos, los mostramos */}
      {terrenos.length > 0 ? (
        <div className="terrenos-list">
          {terrenos.map((terreno) => (
            <div key={terreno.id} className="terreno-item">
              <h3>{terreno.titulo}</h3>
              <p>Descripción: {terreno.descripcion}</p>
              <p>Precio: S/. {terreno.precio}</p>
              <p>Ubicación: {terreno.ubicacion_lat}, {terreno.ubicacion_lon}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>No hay terrenos disponibles.</div>
      )}
    </div>
  );
};

export default DashboardMain;
