import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ImageCarousel from './ImageCarousel';

import '../styles/TerrenoDetalles.css';

const TerrenoDetalles = () => {
  const { id } = useParams();
  const [terreno, setTerreno] = useState(null);
  const [vendedorNombre, setVendedorNombre] = useState('');
  const [loading, setLoading] = useState(true);

  const apiUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://sateliterrreno-production.up.railway.app'
      : 'http://localhost:5000';

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/terrenos/${id}`)
      .then((response) => {
        console.log('Detalles del terreno recibido:', response.data);
        setTerreno(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al obtener los detalles del terreno:', error);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (terreno) {
      axios
        .get(`${apiUrl}/api/usuarios/${terreno.usuario_id}`)
        .then((response) => {
          setVendedorNombre(response.data.nombre);
        })
        .catch((error) => {
          console.error('Error al obtener los detalles del vendedor:', error);
        });
    }
  }, [terreno]);

  if (loading) return <p className="loading">Cargando detalles...</p>;

  if (!terreno) return <p>No se encontraron detalles para este terreno.</p>;

  const whatsappUrl = `https://wa.me/51964755083?text=Hola!%20Estoy%20interesado%20en%20el%20terreno%20${encodeURIComponent(
    terreno.titulo
  )}`;

  const archivos = [
    terreno.imagenes,
    terreno.imagen_2,
    terreno.imagen_3,
    terreno.imagen_4,
    terreno.video,
  ].filter(Boolean); // Solo archivos válidos

  return (
    <div className="terreno-detalles">
      {/* Imagen o video del terreno */}
      <div className="terreno-imagenes">
        {archivos.length > 0 ? (
          <ImageCarousel terreno={terreno} apiUrl={apiUrl} />
        ) : (
          <p className="no-imagenes">No hay imágenes disponibles para este terreno.</p>
        )}
      </div>

      {/* Información del terreno */}
      <div className="terreno-info">
        <div className="info-section">
          <h2>{terreno.titulo}</h2>
          <p><strong>Precio:</strong> {terreno.precio}</p>
          <p><strong>Ubicación:</strong> Lat: {terreno.ubicacion_lat}, Lon: {terreno.ubicacion_lon}</p>
          <p><strong>Descripción:</strong> {terreno.descripcion}</p>
          <p><strong>Estado:</strong> {terreno.estado}</p>
          <p><strong>Vendedor:</strong> {vendedorNombre}</p>

          <div className="detalles-adicionales">
            <div className="column">
              <p><strong>Área:</strong> {terreno.area} m²</p>
              <div className="checklist">
                <p><strong>Luz:</strong> {terreno.cuenta_luz ? '✔' : '✘'}</p>
                <p><strong>Agua:</strong> {terreno.cuenta_agua ? '✔' : '✘'}</p>
              </div>
            </div>

            <div className="column">
              <p><strong>Constancia de Posesión:</strong> {terreno.constancia_posesion ? '✔' : '✘'}</p>
              <p><strong>Registrado en SUNARP:</strong> {terreno.registro_sunarp ? '✔' : '✘'}</p>
              <p><strong>Desagüe:</strong> {terreno.cuenta_desague ? '✔' : '✘'}</p>
            </div>
          </div>
        </div>

        {/* Botón de WhatsApp */}
        <div className="whatsapp-button-container">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-button">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              className="whatsapp-icon"
            />
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default TerrenoDetalles;
