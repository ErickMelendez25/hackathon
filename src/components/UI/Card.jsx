// src/components/ui/Card.jsx
import React from "react";
import "./Card.css";
export default function Card({ title, children }) {
  return (
    <div className="q-card">
      {title && <h3 className="q-card-title">{title}</h3>}
      <div className="q-card-body">{children}</div>
    </div>
  );
}
