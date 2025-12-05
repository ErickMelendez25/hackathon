// src/components/layout/PublicHeader.jsx
import React from "react";
import "./PublicHeader.css";
import { Link } from "react-router-dom";

export default function PublicHeader() {
  return (
    <header className="public-header">
      <div className="container">
        <div className="brand">Universidad Quantum</div>
        <nav className="nav">
          <Link to="/">Inicio</Link>
          <Link to="/#cursos">Cursos</Link>
          <Link to="/login" className="btn">Inicia sesión</Link>
        </nav>
      </div>
    </header>
  );
}
