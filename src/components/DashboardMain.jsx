import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import "../styles/DashboardTerrenos.css";

const DashboardMain = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [terrenos, setTerrenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { categoria } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://sateliterreno-production.up.railway.app' 
    : 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Token de autenticación no encontrado');
      return;
    }

    // Obtener usuarios
    axios.get(`${apiUrl}/api/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      setUsuarios(response.data);
    })
    .catch(error => {
      setError('Error al obtener usuarios');
      console.error('Error al obtener usuarios:', error);
    });

    // Obtener terrenos
    if (categoria === 'terrenos') {
      axios.get(`${apiUrl}/api/terrenos`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setTerrenos(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError('Error al obtener terrenos');
        console.error('Error al obtener terrenos:', error);
        setLoading(false);
      });
    } else {
      setTerrenos([]);
    }
  }, [categoria, apiUrl]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="dashboard">
      {/* Mostrar los terrenos filtrados y los usuarios */}
      <h2>Terrenos</h2>
      <div>
        {terrenos.map((terreno) => (
          <div key={terreno.id}>{terreno.titulo}</div>
        ))}
      </div>
    </div>
  );
};

export default DashboardMain;
