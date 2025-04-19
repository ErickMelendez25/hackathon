import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const Mapa = ({ direccion }) => {
  const [coordenadas, setCoordenadas] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!direccion) return;

    // 1) Detectar si "direccion" es un par de coordenadas "lat, lng"
    const coordMatch = direccion.match(
      /^\s*(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)\s*$/
    );

    if (coordMatch) {
      // coordMatch[1] = lat, coordMatch[3] = lon
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[3]);
      setCoordenadas({ lat, lon });
      setError(null);
      return;
    }

    // 2) Si no es coordenadas, usamos Nominatim para geocodificar
    axios
      .get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: direccion,
          format: 'json',
          addressdetails: 1,
          limit: 1,
          countrycodes: 'PE',
        },
      })
      .then((response) => {
        if (response.data && response.data[0]) {
          const { lat, lon } = response.data[0];
          setCoordenadas({ lat: parseFloat(lat), lon: parseFloat(lon) });
          setError(null);
        } else {
          setError('No se encontraron coordenadas para esta dirección.');
          setCoordenadas(null);
        }
      })
      .catch((err) => {
        console.error('Error al obtener las coordenadas:', err);
        setError('Error al obtener las coordenadas.');
        setCoordenadas(null);
      });
  }, [direccion]);

  if (error) return <p>{error}</p>;
  if (!coordenadas) return <p>Cargando mapa...</p>;

  return (
    <MapContainer
      center={[coordenadas.lat, coordenadas.lon]}
      zoom={17}
      style={{ width: '100%', height: '400px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[coordenadas.lat, coordenadas.lon]}>
        <Popup>{direccion}</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Mapa;
