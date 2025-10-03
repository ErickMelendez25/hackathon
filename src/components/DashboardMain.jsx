import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import "../styles/DashboardTerrenos.css";
import ImageCarousel from './ImageCarousel';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import CountdownTimer from '../components/CountdownTimer';
import "../styles/CountdownTimer.css";

import HackathonSchedule from '../components/HackathonSchedule';
import "../styles/HackathonSchedule.css";

import ProductosView from './ProductosView';

import {
  FaBars,
  FaUserPlus,
  FaClipboardList,
  FaCheck,
  FaBox,
  FaChevronDown,
  FaChevronUp,
  FaMoon,
  FaSun
} from 'react-icons/fa';

import { FacebookShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share';
import { FacebookIcon, TwitterIcon, WhatsappIcon } from 'react-share';

/* ======================
   FUNCIONES AUXILIARES
========================= */

// Exportar solicitudes a Excel
const exportarAExcel = async (solicitudes) => {
  if (!Array.isArray(solicitudes) || solicitudes.length === 0) {
    console.error('No hay datos para exportar');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Solicitudes');

  worksheet.columns = [
    { header: 'ID', key: 'id' },
    { header: 'ID Usuario', key: 'usuario_id' },
    { header: 'Nombre Usuario', key: 'nombre_usuario' },
    { header: 'Correo Usuario', key: 'correo_usuario' },
    { header: 'Nombre', key: 'nombre' },
    { header: 'Correo', key: 'correo' },
    { header: 'Nombre Equipo', key: 'nombre_equipo' },
    { header: 'Nombre Representante', key: 'nombre_representante' },
    { header: 'Correo Contacto', key: 'correo_contacto' },
    { header: 'Universidad', key: 'universidad' },
    { header: 'Departamento', key: 'departamento' },
    { header: 'Provincia', key: 'provincia' },
    { header: 'Distrito', key: 'distrito' },
    { header: 'Cantidad Integrantes', key: 'cantidad_integrantes' },
    { header: 'Tecnologías Usadas', key: 'tecnologias_usadas' },
    { header: 'Nombre Proyecto', key: 'nombre_proyecto' },
    { header: 'Descripción Proyecto', key: 'descripcion_proyecto' },
    { header: 'Acepta Términos', key: 'acepta_terminos' },
    { header: 'Tipo Documento', key: 'tipo_documento' },
    { header: 'Número Documento', key: 'numero_documento' },
    { header: 'Estado', key: 'estado' },
    { header: 'Fecha Solicitud', key: 'fecha_solicitud' },
    { header: 'Fecha Respuesta', key: 'fecha_respuesta' },
  ];

  solicitudes.forEach((s) => {
    worksheet.addRow({
      id: s.id,
      usuario_id: s.usuario_id,
      nombre_usuario: s.nombre_usuario,
      correo_usuario: s.correo_usuario,
      nombre: s.nombre,
      correo: s.correo,
      nombre_equipo: s.nombre_equipo,
      nombre_representante: s.nombre_representante,
      correo_contacto: s.correo_contacto,
      universidad: s.universidad,
      departamento: s.departamento,
      provincia: s.provincia,
      distrito: s.distrito,
      cantidad_integrantes: s.cantidad_integrantes,
      tecnologias_usadas: Array.isArray(s.tecnologias_usadas)
        ? s.tecnologias_usadas.join(', ')
        : s.tecnologias_usadas,
      nombre_proyecto: s.nombre_proyecto,
      descripcion_proyecto: s.descripcion_proyecto,
      acepta_terminos: s.acepta_terminos === 1 ? 'Sí' : 'No',
      tipo_documento: s.tipo_documento,
      numero_documento: s.numero_documento,
      estado: s.estado,
      fecha_solicitud: s.fecha_solicitud
        ? new Date(s.fecha_solicitud).toLocaleString()
        : '',
      fecha_respuesta: s.fecha_respuesta
        ? new Date(s.fecha_respuesta).toLocaleString()
        : '',
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, 'Solicitudes_Hackathon.xlsx');
};

// Leer usuario de forma segura desde localStorage
const getUsuarioSeguro = () => {
  try {
    const raw = localStorage.getItem("usuario");
    if (!raw || raw === "undefined" || raw === "null") return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error al leer usuario:", err);
    return null;
  }
};

/* ======================
   COMPONENTE PRINCIPAL
========================= */
const DashboardMain = () => {
  const [activeShareIndex, setActiveShareIndex] = useState(null);
  const shareMenuRef = useRef(null);

  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openSub, setOpenSub] = useState({ inscripciones: false });

  const { categoria } = useParams();
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [usuarioLocal, setUsuarioLocal] = useState(getUsuarioSeguro());

  const [terrenos, setTerrenos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    estado: 'todos',
    ubicacion: '',
    precioMin: 0,
    precioMax: Infinity,
    moneda: '',
    calificacion: 'todas',
    masVisitados: false,
    rangos: [],
    search: '',
  });

  const apiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://hackathoncontinental.grupo-digital-nextri.com' 
    : 'http://localhost:5000';

  /* ======================
     FUNCIONES DE ESTADO
  ========================= */

  // Compartir
  const handleShare = (index) => {
    setActiveShareIndex(prev => (prev === index ? null : index));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setActiveShareIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obtener usuarios de la API
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    axios.get(`${apiUrl}/api/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setUsuarios(Array.isArray(res.data) ? res.data : []);
    })
    .catch((err) => {
      console.error("Error al obtener usuarios:", err);
      setUsuarios([]);
    });
  }, [apiUrl]);

  // Sincronizar usuario local con la API
  useEffect(() => {
    const user = getUsuarioSeguro();
    if (user) setUsuarioLocal(user);
  }, [usuarios]);

  // Obtener terrenos
  const fetchTerrenos = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${apiUrl}/api/terrenos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTerrenos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al obtener terrenos:", err);
      setTerrenos([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (categoria === 'preseleccion') fetchTerrenos();
  }, [categoria, fetchTerrenos]);

  /* ======================
     RENDER
  ========================= */
  return (
    <div className="dashboard-main">
      <h1>Bienvenido {usuarioLocal ? usuarioLocal.nombre : "Invitado"}</h1>
      <ToastContainer />
      {/* Aquí va el resto de tu JSX: sidebar, terrenos, etc */}
    </div>
  );
};

export default DashboardMain;
