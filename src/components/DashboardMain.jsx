import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/DashboardTerrenos.css";  // Asegúrate de tener un archivo de estilos

const DashboardMain = () => {
  const [terrenos, setTerrenos] = useState([]);  // Guardamos los terrenos
  const [loading, setLoading] = useState(true);  // Para controlar si estamos cargando
  const [error, setError] = useState(null);  // Para manejar los errores

  const apiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://sateliterreno-production.up.railway.app' 
    : 'http://localhost:5000';

  // useEffect para obtener los terrenos
  useEffect(() => {
    const token = localStorage.getItem('authToken');  // Obtener el token de autenticación

    if (!token) {
      setError('Token de autenticación no encontrado');
      setLoading(false);
      return;
    }

    axios.get(`${apiUrl}/api/terrenos`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(response => {
      setTerrenos(response.data);
      setLoading(false);
    })
    .catch(error => {
      setError('Error al obtener terrenos');
      setLoading(false);
    });
  }, [apiUrl]);

  if (loading) return <div>Cargando terrenos...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="dashboard">
      <h2>Lista de Terrenos</h2>
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
