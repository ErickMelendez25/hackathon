// src/pages/DetalleCursoPublico.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { cursosApi } from "../api/cursosApi";
import PublicHeader from "../components/layout/PublicHeader";
import PublicFooter from "../components/layout/PublicFooter";
import "./DetalleCursoPublico.css";

export default function DetalleCursoPublico() {
  const { id } = useParams();
  const [curso, setCurso] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await cursosApi.detalle(id);
        setCurso(res.data);
      } catch (e) {
        setCurso({ id, titulo: "Curso demo", descripcion: "Descripción...", precio: 100 });
      }
    })();
  }, [id]);

  if (!curso) return <div>Cargando...</div>;

  return (
    <>
      <PublicHeader />
      <main className="container detalle-curso">
        <h2>{curso.titulo || curso.title}</h2>
        <p>{curso.descripcion || curso.description}</p>
        <div className="cta">
          <Link to={`/checkout/${curso.id}`} className="mat">Matricular por S/ {curso.precio ?? curso.price}</Link>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
