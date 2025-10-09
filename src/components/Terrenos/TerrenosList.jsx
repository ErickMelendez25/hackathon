import React from "react";
import TerrenoCard from "./TerrenoCard";

export default function TerrenosList({ terrenos, onDelete }) {
  return (
    <div className="terrenos-list">
      {terrenos.map((t) => (
        <TerrenoCard key={t.id} terreno={t} onDelete={onDelete} />
      ))}
    </div>
  );
}
