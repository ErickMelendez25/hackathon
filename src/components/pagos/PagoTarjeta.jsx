// src/components/pagos/PagoTarjeta.jsx
import React from "react";

export default function PagoTarjeta({ invoice }) {
  const pagarConTarjeta = () => {
    // abrir modal de tarjeta o redirigir a MercadoPago / PayPal
    alert("Redirigir a MercadoPago / PayPal (implementa en backend)");
  };

  return (
    <div>
      <h4>Tarjeta</h4>
      <button onClick={pagarConTarjeta}>Pagar con tarjeta</button>
    </div>
  );
}
