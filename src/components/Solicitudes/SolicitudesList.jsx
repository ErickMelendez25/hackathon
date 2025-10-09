import React from "react";

export default function SolicitudesList({ solicitudes, onAprobar, onRechazar }) {
  return (
    <div>
      <h2>Solicitudes</h2>
      {solicitudes.map((sol) => (
        <div key={sol.id} className="solicitud-card">
          <p><b>Nombre:</b> {sol.nombre_usuario}</p>
          <p><b>Correo:</b> {sol.correo_usuario}</p>
          <p><b>Estado:</b> {sol.estado}</p>
          <button onClick={() => onAprobar(sol.id)}>✅ Aprobar</button>
          <button onClick={() => onRechazar(sol.id)}>❌ Rechazar</button>
        </div>
      ))}
    </div>
  );
}
