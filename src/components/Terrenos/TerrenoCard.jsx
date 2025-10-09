import React from "react";

export default function TerrenoCard({ terreno, onDelete }) {
  return (
    <div className="terreno-card">
      <h3>{terreno.titulo}</h3>
      <p>{terreno.descripcion}</p>
      <p>💰 {terreno.precio} {terreno.moneda}</p>
      <p>📍 {terreno.ubicacion_lat}, {terreno.ubicacion_lon}</p>
      <button onClick={() => onDelete(terreno.id)}>🗑 Eliminar</button>
    </div>
  );
}
