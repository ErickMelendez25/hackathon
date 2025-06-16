// HackathonSchedule.jsx
import React from 'react';
import "../styles/HackathonSchedule.css";

const HackathonSchedule = () => {
  const eventos = [
    {
      fecha: "📅 Hasta el 20 de junio",
      titulo: "Inscripciones abiertas",
      descripcion: "Los equipos interesados deben completar su inscripción antes de las 11:59 p.m.",
    },
    {
      fecha: "🧑‍💻 21 de junio",
      titulo: "Reunión virtual de coordinación (Google Meet)",
      descripcion: "Presentación de bases, agenda del evento y resolución de dudas.",
    },
    {
      fecha: "🏛️ 22 y 23 de junio",
      titulo: "Jornada Presencial",
      descripcion: "Desarrollo colaborativo de prototipos en la sede principal de la UNCP.",
    },
    {
      fecha: "📤 24 de junio (hasta las 9:00 a.m.)",
      titulo: "Entrega del Pitch",
      descripcion: "Los equipos deben subir su presentación final con los entregables técnicos.",
    },
    {
      fecha: "🎤 24 de junio (10:00 a.m. en adelante)",
      titulo: "Presentación de proyectos y evaluación",
      descripcion: "Los equipos exponen sus soluciones ante el jurado evaluador.",
    },
    {
      fecha: "🏆 24 de junio (final del día)",
      titulo: "Resultados y Premiación",
      descripcion: "Se anuncian los equipos ganadores, premiación y clausura oficial.",
    },
  ];

  return (
    <div className="cronograma-container">
      <h2 className="cronograma-titulo">🗓️ Cronograma de la Hackathon UNCP</h2>
      <div className="cronograma-lista">
        {eventos.map((evento, index) => (
          <div key={index} className="evento-card">
            <div className="evento-fecha">{evento.fecha}</div>
            <div className="evento-detalle">
              <h3>{evento.titulo}</h3>
              <p>{evento.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HackathonSchedule;
