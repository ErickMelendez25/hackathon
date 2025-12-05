// src/pages/DashboardSecretaria.jsx
import React from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../components/layout/DashboardHeader";
import DashboardFooter from "../components/layout/DashboardFooter";


export default function DashboardSecretaria() {
  return (
    <>
      <DashboardHeader />

      <div style={{ padding: "30px" }}>
        <h1>Panel de Secretaría</h1>
        <p>Bienvenida, secretaria. Selecciona una acción:</p>

        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          <Link to="/dashboard/secretaria/matriculas">
            <button>📘 Gestionar Matrículas</button>
          </Link>

          <Link to="/dashboard/secretaria/pagos">
            <button>💳 Registrar Pagos</button>
          </Link>

          <Link to="/dashboard/secretaria/cursos">
            <button>📚 Gestión de Cursos</button>
          </Link>
        </div>
      </div>

      <DashboardFooter />
    </>
  );
}
