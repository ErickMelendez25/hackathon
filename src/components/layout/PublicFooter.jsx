// src/components/layout/PublicFooter.jsx
import React from "react";
import "./PublicFooter.css";

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container">
        <div>© {new Date().getFullYear()} Universidad Quantum</div>
        <div>Contacto: info@universidadquantum.edu.pe</div>
      </div>
    </footer>
  );
}
