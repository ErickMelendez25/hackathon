import React, { useState } from "react";
import { pagoEfectivo } from "../../api/secretariaApi";
import "./RegistrarPago.css";

export default function RegistrarPago() {
  const [form, setForm] = useState({});

  const registrar = async () => {
    try {
      const res = await pagoEfectivo(form);
      alert("Pago registrado, factura #" + res.data.factura_id);
      setForm({});
    } catch (e) {
      console.error(e);
      alert("Error al registrar pago");
    }
  };

  return (
    <div className="reg-pago-card">
      <h2>Registrar pago en efectivo</h2>
      <input placeholder="ID Alumno" value={form.usuario_id || ""} onChange={e => setForm({ ...form, usuario_id: e.target.value })} />
      <input placeholder="ID Matrícula" value={form.matricula_id || ""} onChange={e => setForm({ ...form, matricula_id: e.target.value })} />
      <input placeholder="ID Sección" value={form.seccion_id || ""} onChange={e => setForm({ ...form, seccion_id: e.target.value })} />
      <input placeholder="Monto" value={form.monto || ""} onChange={e => setForm({ ...form, monto: e.target.value })} />
      <div className="reg-actions">
        <button className="primary" onClick={registrar}>Registrar</button>
      </div>
    </div>
  );
}
