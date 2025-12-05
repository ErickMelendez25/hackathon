import React, { useEffect, useState } from "react";
import axios from "axios";
import "./GestionUsuarios.css";
const API_URL = import.meta.env.VITE_API_URL;

export default function GestionUsuarios(){
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [edicion, setEdicion] = useState(null);
  const [nuevo, setNuevo] = useState({nombre:"",apellido_paterno:"",apellido_materno:"",correo:"",rol:"ESTUDIANTE"});

  const cargar = async () => {
    try {
      const res = await axios.get(`${API_URL}/usuarios`);
      setUsuarios(res.data || []);
    } catch(e){ console.error(e) }
  };
  useEffect(()=>{ cargar() },[]);

  const crear = async () => {
    try {
      await axios.post(`${API_URL}/usuarios`, nuevo);
      setNuevo({nombre:"",apellido_paterno:"",apellido_materno:"",correo:"",rol:"ESTUDIANTE"});
      cargar();
      alert("Usuario creado");
    } catch(e){ console.error(e); alert("Error al crear usuario") }
  };

  const guardar = async () => {
    try {
      await axios.put(`${API_URL}/usuarios/${edicion.id}`, edicion);
      setEdicion(null);
      cargar();
    } catch(e){ console.error(e); alert("Error al actualizar") }
  };

  const eliminar = async (id) => {
    if(!confirm("Eliminar usuario?")) return;
    try {
      await axios.delete(`${API_URL}/usuarios/${id}`);
      cargar();
    } catch(e){ console.error(e); alert("Error al eliminar") }
  };

  const filtrados = usuarios.filter(u => {
    if (!filtro) return true;
    const q = filtro.toLowerCase();
    return [u.nombre,u.apellido_paterno,u.apellido_materno,u.correo].join(" ").toLowerCase().includes(q)
  });

  return (
    <div className="gestion-wrap">
      <h2>Gestión de usuarios</h2>
      <div className="top-row">
        <input placeholder="Buscar usuarios..." value={filtro} onChange={e=>setFiltro(e.target.value)} />
      </div>

      <div className="two-column">
        <div className="list">
          <ul>
            {filtrados.map(u => (
              <li key={u.id}>
                <div>
                  <strong>{u.nombre} {u.apellido_paterno}</strong><br/>
                  <small>{u.correo} · {u.rol}</small>
                </div>
                <div className="actions">
                  <button onClick={()=>setEdicion(u)}>Editar</button>
                  <button onClick={()=>eliminar(u.id)} className="danger">Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="form">
          {edicion ? (
            <>
              <h3>Editar usuario</h3>
              <input value={edicion.nombre || ""} onChange={e=>setEdicion({...edicion,nombre:e.target.value})} />
              <input value={edicion.apellido_paterno || ""} onChange={e=>setEdicion({...edicion,apellido_paterno:e.target.value})} />
              <input value={edicion.correo || ""} onChange={e=>setEdicion({...edicion,correo:e.target.value})} />
              <select value={edicion.rol} onChange={e=>setEdicion({...edicion,rol:e.target.value})}>
                <option>ESTUDIANTE</option><option>SECRETARIA</option><option>ADMIN</option><option>DOCENTE</option>
              </select>
              <div className="form-actions">
                <button className="primary" onClick={guardar}>Guardar</button>
                <button onClick={()=>setEdicion(null)}>Cancelar</button>
              </div>
            </>
          ) : (
            <>
              <h3>Crear usuario</h3>
              <input placeholder="Nombre" value={nuevo.nombre} onChange={e=>setNuevo({...nuevo,nombre:e.target.value})}/>
              <input placeholder="Apellido paterno" value={nuevo.apellido_paterno} onChange={e=>setNuevo({...nuevo,apellido_paterno:e.target.value})}/>
              <input placeholder="Apellido materno" value={nuevo.apellido_materno} onChange={e=>setNuevo({...nuevo,apellido_materno:e.target.value})}/>
              <input placeholder="Correo" value={nuevo.correo} onChange={e=>setNuevo({...nuevo,correo:e.target.value})}/>
              <select value={nuevo.rol} onChange={e=>setNuevo({...nuevo,rol:e.target.value})}>
                <option>ESTUDIANTE</option><option>SECRETARIA</option><option>ADMIN</option><option>DOCENTE</option>
              </select>
              <div className="form-actions">
                <button className="primary" onClick={crear}>Crear</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
