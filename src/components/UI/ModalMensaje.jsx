import React, { useEffect } from "react";
import "./ModalMensaje.css";

export default function ModalMensaje({ visible, mensaje, onClose }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // se oculta solo

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <p>{mensaje}</p>
      </div>
    </div>
  );
}
