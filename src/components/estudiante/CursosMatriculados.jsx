// src/components/estudiante/CursosMatriculados.jsx
import React from "react";
import "./CursosMatriculados.css";

export default function CursosMatriculados({ matriculas }) {
  if (!matriculas?.length) return <div>No tienes cursos matriculados aún.</div>;

  return (
    <div className="cursos-matriculados">
      {matriculas.map(m => (
        <div key={m.id} className="curso-item">
          <h4>{m.course_title || m.titulo}</h4>
          <div>Sección: {m.section_code || m.seccion_codigo}</div>
          <div>Modalidad: {m.modality || m.modalidad}</div>
          <div className="acciones">
            {/* Abrir Moodle embebido */}
            {m.moodle_course_id && (
              <a href={`/moodle/iframe/${m.moodle_course_id}`} target="_blank" rel="noreferrer">Abrir en Moodle</a>
            )}
            {/* Ir a sesión en vivo (meet) */}
            {m.next_session && <a href={m.next_session.meet_link} target="_blank" rel="noreferrer">Ir a clase</a>}
          </div>
        </div>
      ))}
    </div>
  );
}
