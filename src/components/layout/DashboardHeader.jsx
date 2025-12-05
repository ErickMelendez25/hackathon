// src/components/layout/DashboardHeader.jsx
import React, { useContext } from "react";
import "./DashboardHeader.css";
import { AuthContext } from "../../context/AuthContext";

export default function DashboardHeader() {
  const { usuario, logout } = useContext(AuthContext);
  return (
    <header className="dash-header">
      <div className="container">
        <div className="brand">Quantum • Panel</div>
        <div className="user-area">
          <span>Hola, {usuario?.nombre ?? "Usuario"}</span>
          <button onClick={logout} className="btn-logout">Cerrar sesión</button>
        </div>
      </div>
    </header>
  );
}
