import React, { useEffect, useState } from "react";
import axios from "axios";
import axiosClient from "../../api/axiosClient.js";  // ← AQUI EL FIX
import { crearAlumno, matricularAlumno, pagoEfectivo, pagoPasarela } from "../../api/secretariaApi";
import "./MatricularAlumno.css";
import DashboardHeader from "../layout/DashboardHeader";
import DashboardFooter from "../layout/DashboardFooter";


const API_URL = import.meta.env.VITE_API_URL;

export default function MatricularAlumno() {
  const [cursos, setCursos] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [seccionSeleccionada, setSeccionSeleccionada] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [showCrearAlumno, setShowCrearAlumno] = useState(false);
  const [nuevoAlumno, setNuevoAlumno] = useState({});
  const [errores, setErrores] = useState({});

  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModalPago, setShowModalPago] = useState(false);
  const [tipoPago, setTipoPago] = useState(""); // EFECTIVO | PASARELA
  const [montoCurso, setMontoCurso] = useState(0);


  const validarCampo = (campo, valor) => {
  let msg = "";
  const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const dniRegex = /^\d{8}$/;
  const telRegex = /^\d{9}$/;

  if (campo === "nombre" || campo === "apellido_paterno" || campo === "apellido_materno") {
    if (!soloLetras.test(valor)) msg = "Solo se permiten letras.";
  }

  if (campo === "correo") {
    if (!emailRegex.test(valor)) msg = "Correo inválido.";
  }

  if (campo === "numero_documento") {
    if (!dniRegex.test(valor)) msg = "El DNI debe tener 8 dígitos.";
  }

  if (campo === "telefono") {
    if (!telRegex.test(valor)) msg = "El teléfono debe tener 9 dígitos.";
  }

  // actualizar estado
  setErrores(prev => ({ ...prev, [campo]: msg }));
};


  // cargar cursos
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_URL}/cursos`);
        setCursos(res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  // cargar estudiantes (para lista)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_URL}/estudiantes`);
        setEstudiantes(res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  // cuando cambia curso, traer secciones
  // cuando cambia curso, traer secciones
useEffect(() => {
  const load = async () => {
    if (!cursoSeleccionado) {
      setSecciones([]);
      setSeccionSeleccionada("");
      setMontoCurso(0);
      return;
    }

    try {
      const res = await axiosClient.get(`/secciones/curso/${cursoSeleccionado}`);
      const lista =
  Array.isArray(res.data) ? res.data :
  Array.isArray(res.data.secciones) ? res.data.secciones :
  [];

setSecciones(lista);



      // buscar curso por ID
      const curso = cursos.find(c => String(c.id) === String(cursoSeleccionado));

      // evitar que React explote
      setMontoCurso(curso?.precio ?? 0);

    } catch (e) {
      console.error("Error cargando secciones:", e);
    }
  };

  load();
}, [cursoSeleccionado, cursos]);



  // buscar por filtro
  const resultadosFiltrados = estudiantes.filter((est) => {
    if (!filtro) return true;
    const q = filtro.toLowerCase();
    return (
      (est.nombre && est.nombre.toLowerCase().includes(q)) ||
      (est.apellido_paterno && est.apellido_paterno.toLowerCase().includes(q)) ||
      (est.apellido_materno && est.apellido_materno.toLowerCase().includes(q)) ||
      (est.numero_documento?.includes(q)) ||
      (est.dni?.includes(q))

    );
  });

  const seleccionarEstudiante = (est) => {
    setEstudianteSeleccionado(est);
    setMensaje(null);
  };

  // crear alumno manualmente (desde modal)
  const handleCrearAlumno = async () => {
    try {
      const payload = {
        nombre: nuevoAlumno.nombre,
        apellido_paterno: nuevoAlumno.apellido_paterno,
        apellido_materno: nuevoAlumno.apellido_materno,
        correo: nuevoAlumno.correo,
        numero_documento: nuevoAlumno.numero_documento,

        telefono: nuevoAlumno.telefono,
      };


      // VALIDACIONES ----------------------------

      // Solo letras (nombre y apellidos)
      const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

      if (!soloLetras.test(nuevoAlumno.nombre)) {
        setMensaje("El nombre solo debe contener letras.");
        return;
      }
      if (!soloLetras.test(nuevoAlumno.apellido_paterno)) {
        setMensaje("El apellido paterno solo debe contener letras.");
        return;
      }
      if (nuevoAlumno.apellido_materno && !soloLetras.test(nuevoAlumno.apellido_materno)) {
        setMensaje("El apellido materno solo debe contener letras.");
        return;
      }

      // Correo válido
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(nuevoAlumno.correo)) {
        setMensaje("Ingrese un correo válido.");
        return;
      }

      // DNI → exactamente 8 dígitos
      const dniRegex = /^\d{8}$/;
      if (!dniRegex.test(nuevoAlumno.numero_documento)) {
        setMensaje("El DNI debe tener exactamente 8 dígitos.");
        return;
      }

      // Teléfono → exactamente 9 dígitos
      const telRegex = /^\d{9}$/;
      if (!telRegex.test(nuevoAlumno.telefono)) {
        setMensaje("El teléfono debe tener exactamente 9 dígitos.");
        return;
      }
      // -----------------------------------------


      if (
        !nuevoAlumno.nombre ||
        !nuevoAlumno.apellido_paterno ||
        !nuevoAlumno.correo ||
        !nuevoAlumno.numero_documento
      ) {
        setMensaje("Por favor complete todos los campos obligatorios.");
        return;
      }

      const res = await crearAlumno(payload);
      const usuario_id = res.data.usuario_id;
      // refrescar lista
      const r = await axios.get(`${API_URL}/estudiantes`);
      setEstudiantes(r.data || []);
      // seleccionar creado
      const creado = r.data.find(x => x.id === usuario_id) || null;
      setEstudianteSeleccionado(creado);
      setShowCrearAlumno(false);
      setNuevoAlumno({});
      setMensaje("Alumno creado correctamente.");
  } catch (e) {
    console.error("ERROR CREANDO ALUMNO:", e.response?.data || e);
    setMensaje(e.response?.data?.error || "Error creando alumno.");
  }

  };

const confirmarMatricula = async () => {
  if (!estudianteSeleccionado || !cursoSeleccionado) {
    setMensaje("Seleccione estudiante y curso.");
    return;
  }

  setLoading(true);

  try {
    // 🔍 Buscar matrícula exacta por usuario + curso + sección
    const check = await axiosClient.get(`/matriculas/usuario/${estudianteSeleccionado.id}`);
    const existente = check.data.find(m =>
      String(m.curso_id) === String(cursoSeleccionado) &&
      String(m.seccion_id || "") === String(seccionSeleccionada || "")
    );

    if (existente) {
      if (existente.estado === "ACTIVO") {
        setMensaje("⚠️ El alumno ya tiene esta matrícula pagada.");
        setLoading(false);
        return;
      } 
      if (existente.estado === "PENDIENTE") {
        setMensaje("ℹ️ Existe matrícula pendiente. Puedes registrar el pago.");
        if (tipoPago === "EFECTIVO") setShowModalPago(true); // abrir modal si es pago efectivo
        setLoading(false);
        return;
      }
    }

    // 🔹 Si no existe matrícula → decidir según tipo de pago
    if (tipoPago === "EFECTIVO") {
      // Abrir modal para crear matrícula y pagar
      setShowModalPago(true);
    } else if (tipoPago === "PASARELA") {
      // Iniciar pasarela sin crear matrícula todavía
      await pagoPasarela({
        alumno: estudianteSeleccionado.id,
        curso: cursoSeleccionado,
        seccion_id: seccionSeleccionada || null,
      });
      setMensaje("Pasarela iniciada: escanee QR o complete tarjeta.");
    } else {
      // Tipo de pago pendiente → crear matrícula como pendiente
      const body = {
        usuario_id: estudianteSeleccionado.id,
        curso_id: cursoSeleccionado,
        seccion_id: seccionSeleccionada || null,
      };
      await matricularAlumno(body);
      setMensaje("ℹ️ Matrícula registrada como pendiente.");
    }

  } catch (e) {
    console.error("Error confirmando matrícula:", e.response?.data || e);
    const msg = e.response?.data?.error;
    setMensaje(msg || "Error inesperado al procesar matrícula.");
  }

  setLoading(false);
};

const confirmarPagoEfectivo = async () => {
  if (!estudianteSeleccionado) {
    setMensaje("Selección de alumno inválida.");
    return;
  }

  setLoading(true);

  const payloadMatricula = {
    usuario_id: estudianteSeleccionado.id,
    curso_id: cursoSeleccionado,
    seccion_id: seccionSeleccionada || null,
  };

  let matricula_id = null;

  try {
    // 🚩 1) Verificar si ya existe una matrícula previa
    const check = await axiosClient.get(`/matriculas/usuario/${estudianteSeleccionado.id}`);
    const existente = check.data.find(m =>
      String(m.curso_id) === String(cursoSeleccionado) &&
      String(m.seccion_id || "") === String(seccionSeleccionada || "")
    );

    if (existente) {
      if (existente.estado === "PENDIENTE") {
        matricula_id = existente.id; // usar matrícula pendiente
      } else if (existente.estado === "ACTIVO") {
        setShowModalPago(false);
        setMensaje("⚠️ El alumno ya tiene esta matrícula pagada.");
        setLoading(false);
        return;
      }
    } else {
      // 🚀 2) NO existe → crear matrícula nueva
      const matRes = await matricularAlumno(payloadMatricula);
      matricula_id = matRes.data.matricula_id;
    }

  } catch (e) {
    console.error("Error verificando/creando matrícula:", e);
    const msg = e.response?.data?.error;
    setShowModalPago(false);
    setMensaje(msg || "Error inesperado al validar matrícula.");
    setLoading(false);
    return;
  }

  // 🔥 3) MATRÍCULA LISTA → PAGAR
  try {
    const pagoRes = await pagoEfectivo({
      usuario_id: estudianteSeleccionado.id,
      matricula_id,
      seccion_id: seccionSeleccionada,
      monto: montoCurso,
    });

    setShowModalPago(false);
    setMensaje(`✅ Pago registrado correctamente. Factura #${pagoRes.data.factura_id}`);

  } catch (e) {
    console.error("Error pago efectivo:", e.response?.data || e);
    const msg = e.response?.data?.error;
    setShowModalPago(false);
    setMensaje(msg || "Error inesperado registrando pago.");
  }

  setLoading(false);
};




  console.log({
  cursos,
  secciones,
  estudiantes,
  cursoSeleccionado,
  seccionSeleccionada,
  estudianteSeleccionado
});

return (
  <div className="matricula-page">

    {/* ======= HEADER ======= */}
    <DashboardHeader />

    {/* ======= CONTENIDO PRINCIPAL ======= */}
    <div className="matricula-wrap">

      <div className="toolbar">
        <h2>📘 Matricular alumno</h2>
        <div className="search-box">
          <input 
            placeholder="Buscar por nombre, apellidos o DNI..." 
            value={filtro} 
            onChange={(e)=>setFiltro(e.target.value)} 
          />
        </div>
      </div>

      <div className="grid">
        <div className="panel estudiantes">
          <div className="panel-head">
            <h3>Estudiantes</h3>
            <button onClick={() => setShowCrearAlumno(true)} className="small">
              + Nuevo
            </button>
          </div>

          <ul className="lista-estudiantes">
            {resultadosFiltrados.map((est) => (
              <li 
                key={est.id} 
                className={estudianteSeleccionado?.id === est.id ? "selected" : ""} 
                onClick={() => seleccionarEstudiante(est)}
              >
                <div className="name">
                  {est.nombre} {est.apellido_paterno} {est.apellido_materno}
                </div>
                <div className="meta">
                  {est.numero_documento || est.dni || "—"} · {est.correo}
                </div>
              </li>
            ))}

            {resultadosFiltrados.length === 0 && (
              <li className="empty">No hay estudiantes</li>
            )}
          </ul>
        </div>

        <div className="panel detalle">
          <h3>Detalle</h3>

          {estudianteSeleccionado ? (
            <div>
              <div className="card">
                <strong>
                  {estudianteSeleccionado.nombre} {estudianteSeleccionado.apellido_paterno}
                </strong>

                <div>
                  DNI: {estudianteSeleccionado.numero_documento || estudianteSeleccionado.dni || "—"}
                </div>

                <div>Correo: {estudianteSeleccionado.correo}</div>
                <div>Tel: {estudianteSeleccionado.telefono}</div>
              </div>

              <label>Curso</label>
              <select value={cursoSeleccionado} onChange={e => setCursoSeleccionado(e.target.value)}>
                <option value="">Seleccione un curso</option>
                {cursos.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.titulo} — S/ {c.precio ?? 0}
                  </option>
                ))}
              </select>

              <label>Sección / Modalidad</label>
              <select value={seccionSeleccionada} onChange={e => setSeccionSeleccionada(e.target.value)}>
                <option value="">(Dejar en blanco si no aplica)</option>
                {secciones.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.periodo} — {s.modalidad}
                  </option>
                ))}
              </select>

              <label>Tipo de pago</label>
              <div className="pago-row">
                <label>
                  <input type="radio" name="pago" value="EFECTIVO" checked={tipoPago==="EFECTIVO"} onChange={()=>setTipoPago("EFECTIVO")} /> 
                  Efectivo
                </label>

                <label>
                  <input type="radio" name="pago" value="PASARELA" checked={tipoPago==="PASARELA"} onChange={()=>setTipoPago("PASARELA")} /> 
                  Pasarela (Yape / Tarjeta)
                </label>

                <label>
                  <input type="radio" name="pago" value="" checked={tipoPago===""} onChange={()=>setTipoPago("")} /> 
                  Pendiente
                </label>
              </div>

              <div className="actions">
                <button className="primary" onClick={confirmarMatricula} disabled={loading}>
                  {loading ? "Procesando..." : "Registrar matrícula"}
                </button>

                <button className="secondary" onClick={()=>{
                  setEstudianteSeleccionado(null);
                  setMensaje(null);
                }}>
                  Limpiar
                </button>
              </div>

              {mensaje && <div className="mensaje">{mensaje}</div>}
            </div>
          ) : (
            <div className="empty">Selecciona un estudiante para ver opciones</div>
          )}
        </div>
      </div>

      {/* ========== MODAL CREAR ALUMNO ========== */}
      {showCrearAlumno && (
        <div className="modal">
          <div className="modal-card">
            <h3>Crear alumno</h3>

            {/* Campos */}
            {/* (NO se modifica nada aquí) */}
            {/* Mantengo todo tu código tal cual… */}
            {/* …para no romper validaciones */}
            {/**  ------------------------------  **/}

            <label>Nombre</label>
            <input
              value={nuevoAlumno.nombre || ""}
              onChange={(e)=>{
                const v = e.target.value;
                setNuevoAlumno({ ...nuevoAlumno, nombre: v });
                validarCampo("nombre", v);
              }}
              className={errores.nombre ? "input-error" : ""}
            />
            {errores.nombre && <span className="error-text">{errores.nombre}</span>}

            <label>Apellido paterno</label>
            <input
              value={nuevoAlumno.apellido_paterno || ""}
              onChange={(e)=>{
                const v = e.target.value;
                setNuevoAlumno({ ...nuevoAlumno, apellido_paterno: v });
                validarCampo("apellido_paterno", v);
              }}
              className={errores.apellido_paterno ? "input-error" : ""}
            />
            {errores.apellido_paterno && <span className="error-text">{errores.apellido_paterno}</span>}

            <label>Apellido materno</label>
            <input
              value={nuevoAlumno.apellido_materno || ""}
              onChange={(e)=>{
                const v = e.target.value;
                setNuevoAlumno({ ...nuevoAlumno, apellido_materno: v });
                validarCampo("apellido_materno", v);
              }}
              className={errores.apellido_materno ? "input-error" : ""}
            />
            {errores.apellido_materno && <span className="error-text">{errores.apellido_materno}</span>}

            <label>Correo</label>
            <input
              value={nuevoAlumno.correo || ""}
              onChange={(e)=>{
                const v = e.target.value;
                setNuevoAlumno({ ...nuevoAlumno, correo: v });
                validarCampo("correo", v);
              }}
              className={errores.correo ? "input-error" : ""}
            />
            {errores.correo && <span className="error-text">{errores.correo}</span>}

            <label>DNI</label>
            <input
              value={nuevoAlumno.numero_documento || ""}
              onChange={(e)=>{
                const v = e.target.value;
                setNuevoAlumno({ ...nuevoAlumno, numero_documento: v });
                validarCampo("numero_documento", v);
              }}
              className={errores.numero_documento ? "input-error" : ""}
            />
            {errores.numero_documento && <span className="error-text">{errores.numero_documento}</span>}

            <label>Teléfono</label>
            <input
              value={nuevoAlumno.telefono || ""}
              onChange={(e)=>{
                const v = e.target.value;
                setNuevoAlumno({ ...nuevoAlumno, telefono: v });
                validarCampo("telefono", v);
              }}
              className={errores.telefono ? "input-error" : ""}
            />
            {errores.telefono && <span className="error-text">{errores.telefono}</span>}

            <div className="modal-actions">
              <button className="primary" onClick={handleCrearAlumno}>
                Crear y seleccionar
              </button>
              <button className="secondary" onClick={()=>setShowCrearAlumno(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL PAGO ========== */}
      {showModalPago && (
        <div className="modal">
          <div className="modal-card">
            <h3>Confirmar pago en efectivo</h3>
            <p>
              Estudiante: <b>{estudianteSeleccionado?.nombre} {estudianteSeleccionado?.apellido_paterno}</b>
            </p>

            <p>Monto a abonar: <b>S/ {montoCurso}</b></p>

            <p>¿Seguro que desea efectuar el pago?</p>

            <div className="modal-actions">
              <button className="primary" onClick={confirmarPagoEfectivo}>Sí, registrar pago</button>
              <button className="secondary" onClick={()=>setShowModalPago(false)}>No, cancelar</button>
            </div>
          </div>
        </div>
      )}

    </div>

    {/* ======= FOOTER ======= */}
    <DashboardFooter />

  </div>
);

}
