// src/pages/DashboardEstudiante.jsx
import React, { useContext, useEffect, useState } from "react";
import DashboardHeader from "../components/layout/DashboardHeader";
import DashboardFooter from "../components/layout/DashboardFooter";
import { AuthContext } from "../context/AuthContext";
import matriculasApi from "../api/matriculasApi";



import { moodleApi } from "../api/moodleApi";
import CursosMatriculados from "../components/estudiante/CursosMatriculados";
import EstadosPagos from "../components/estudiante/EstadosPagos";
import "./DashboardEstudiante.css";

export default function DashboardEstudiante() {
  const { usuario } = useContext(AuthContext);
  const [matriculas, setMatriculas] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await matriculasApi.misMatriculas(usuario.id);
        setMatriculas(res.data);
      } catch (e) {
        setMatriculas([]);
      }
    })();
  }, [usuario]);

  return (
    <>
      <DashboardHeader />
      <main className="dashboard container">
        <aside className="left-col">
          <h3>Bienvenido, {usuario?.nombre}</h3>
          <EstadosPagos userId={usuario?.id} />
        </aside>

        <section className="main-col">
          <h2>Mis cursos</h2>
          <CursosMatriculados matriculas={matriculas} />
        </section>
      </main>
      <DashboardFooter />
    </>
  );
}
