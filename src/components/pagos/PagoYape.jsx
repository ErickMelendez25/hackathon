// src/components/pagos/PagoYape.jsx
import React from "react";
import { pagosApi } from "../../api/pagosApi";

export default function PagoYape({ invoice }) {
  const generarQr = async () => {
    const res = await pagosApi.generarYapeQR({ invoiceId: invoice.id, amount: invoice.total });
    // respuesta puede contener payload/imagen
    window.open(res.data.qr_url || "#");
  };

  return (
    <div>
      <h4>Yape (QR)</h4>
      <button onClick={generarQr}>Generar QR</button>
    </div>
  );
}
