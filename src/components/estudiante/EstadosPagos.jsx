import React, { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./EstadosPagos.css";

export default function EstadosPagos({ userId }) {
  const [facturas, setFacturas] = useState([]);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const res = await axiosClient.get(`/facturas/usuario/${userId}`);
        setFacturas(res.data);
      } catch (error) {
        console.error("Error al cargar facturas:", error);
        setFacturas([]);
      }
    })();
  }, [userId]);

  return (
    <div>
      <h4>Estado económico</h4>
      {!facturas.length && <div>No hay facturas</div>}

      <ul className="lista-facturas">
        {facturas.map(f => (
          <li key={f.id} className="factura-item">
            <div><strong>Factura:</strong> {f.numero_factura}</div>
            <div><strong>Monto:</strong> S/ {f.total_amount}</div>
            <div><strong>Estado:</strong> {f.status}</div>
            <div><strong>Fecha/Hora pago:</strong> {new Date(f.fecha_pago).toLocaleString()}</div>
            <div><strong>Curso:</strong> {f.course_title}</div>
            <div><strong>Sección:</strong> {f.section_code}</div>
            <div><strong>Modalidad:</strong> {f.modalidad}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
