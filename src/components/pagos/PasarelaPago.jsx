// src/components/pagos/PasarelaPago.jsx
import React from "react";
import PagoYape from "./PagoYape";
import PagoTarjeta from "./PagoTarjeta";
import "./PasarelaPago.css";

export default function PasarelaPago({ invoice }) {
  return (
    <div className="pasarela">
      <h3>Pagar S/ {invoice.total}</h3>
      <div className="ops">
        <PagoYape invoice={invoice} />
        <PagoTarjeta invoice={invoice} />
      </div>
    </div>
  );
}
