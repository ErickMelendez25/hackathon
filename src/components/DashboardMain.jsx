import React, { useState, useEffect, useCallback, useRef } from 'react';

import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import "../styles/DashboardTerrenos.css";
import ImageCarousel from './ImageCarousel'; // Asegúrate de que la ruta sea correcta
import { io } from 'socket.io-client';

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

//PARA LAS SOLICITUDES:

//PARA EL RELOJ




import { FacebookShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share';
import { FacebookIcon, TwitterIcon, WhatsappIcon } from 'react-share';

const DashboardMain = () => {

// Estado para el índice del terreno que tiene abierto el menú de compartir
  const [activeShareIndex, setActiveShareIndex] = useState(null);
 

  const shareMenuRef = useRef(null); // Referencia al menú

const [darkMode, setDarkMode] = useState(false);

const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // oculta texto
const [openSub, setOpenSub] = useState({ inscripciones: false });






// Función para abrir/cerrar menú
  const handleShare = (index) => {
    setActiveShareIndex(prev => (prev === index ? null : index));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setActiveShareIndex(null); // ✅ ¡Esto es lo importante!
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  



  const url = window.location.href;  // Puedes cambiar esto según lo que quieras compartir
  const text = "¡Mira este producto interesante!";
  const [usuarios, setUsuarios] = useState([]);


  const [editMode, setEditMode] = useState(false);
  

// Obtener usuario desde localStorage de forma segura
const getUsuarioSeguro = () => {
  try {
    const raw = localStorage.getItem("usuario");
    if (!raw || raw === "undefined" || raw === "null") {
      return null;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error al leer usuario:", err);
    return null;
  }
};

const [usuarioLocal, setUsuarioLocal] = useState(getUsuarioSeguro());



const apiUrl = import.meta.env.VITE_API_URL;


  // Obtener elementos necesarios
  useEffect(() => {
    console.log('usuarioLocal ha cambiado:', usuarioLocal);
  }, [usuarioLocal]);
  


  const [sidebarActive, setSidebarActive] = useState(false);  
  
  //para corazones
  const [liked, setLiked] = useState([]);
  const toggleLike = (i) => {
    setLiked(prev => {
      const copy = [...prev];
      copy[i] = !copy[i];
      return copy;
    });
  };

  const detailRefs = useRef([]);

  const burstHearts = (idx, e) => {
    const container = detailRefs.current[idx];
    if (!container) return;
  
    // Calcula posición relativa del click dentro del container
    const rect = container.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
  
    for (let i = 0; i < 8; i++) {
      const heart = document.createElement('span');
      heart.className = 'burst-heart';
      heart.style.position = 'absolute';
      heart.style.left = `${startX}px`;
      heart.style.top = `${startY}px`;
      heart.style.transform = 'translate(0,0) scale(0.5)';
      heart.style.opacity = '1';
      heart.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
  
      // crea desplazamientos aleatorios
      const dx = (Math.random() - 0.5) * 120;   // entre -60 y +60 px
      const dy = (Math.random() - 1) * 120;     // entre -120 y 0 px (suben)
  
      container.appendChild(heart);
  
      // dispara la animación en el siguiente frame
      requestAnimationFrame(() => {
        heart.style.transform = `translate(${dx}px, ${dy}px) scale(1)`;
        heart.style.opacity = '0';
      });
  
      // elimina tras completar la transición
      heart.addEventListener('transitionend', () => heart.remove());
    }
  };
  
  const [likeCounts, setLikeCounts] = useState([]);


  const changeCategory = (newCategory) => {
    navigate(`/dashboard/${newCategory}`);  // Navega usando `navigate`
    setSidebarActive(false); // Cierra la barra lateral cuando se selecciona una categoría
    setShowForm(false);
  };
 




  const { categoria } = useParams();
  const navigate = useNavigate();

  const [terrenos, setTerrenos] = useState([]);

  
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado: 'todos',
    ubicacion: '',
    precioMin: 0,
    precioMax: Infinity,
    moneda: 'soles',
    calificacion: 'todas',
    masVisitados: false,
    rangos: [], // aquí van los valores como '0-500', etc.
    search: '',
    moneda:'',
  });

  const toggleRango = (rango) => {
    setFilters((prevFilters) => {
      const yaExiste = prevFilters.rangos.includes(rango);
      const nuevosRangos = yaExiste
        ? prevFilters.rangos.filter(r => r !== rango)
        : [...prevFilters.rangos, rango];
      return { ...prevFilters, rangos: nuevosRangos };
    });
  };
  
  const [showForm, setShowForm] = useState(false);
const [formData, setFormData] = useState({
  nombreEquipo: '',
  nombreRepresentante: '',
  correo: '',
  tipoDocumento: '',
  numeroDocumento: '',
  universidad: '',
  departamento: '',
  provincia: '',
  distrito: '',
  cantidadIntegrantes: 1,
  tecnologiasUsadas: [],
  nombreProyecto: '',
  descripcionProyecto: '',
  participantes: [
    { dni: '', nombre: '' }
  ],
  aceptaTerminos: false
});


const agregarParticipante = () => {
  setFormData({
    ...formData,
    participantes: [...formData.participantes, { dni: '', nombre: '' }]
  });
};

const updateParticipante = (index, campo, valor) => {
  const nuevosParticipantes = [...formData.participantes];
  nuevosParticipantes[index][campo] = valor;
  setFormData({ ...formData, participantes: nuevosParticipantes });
};



  const [vendedorFormData, setVendedorFormData] = useState({
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    consentimiento: false,
  });

  



  // Obtener los usuarios desde la API
  useEffect(() => {
    // Establecer la URL de la API según el entorno (producción o desarrollo)
    const apiUrl = import.meta.env.VITE_API_URL;

  
    // Obtener el token desde localStorage para incluirlo en el encabezado de autorización
    const token = localStorage.getItem('authToken'); 
    console.log("Token obtenido: ", token); // Verificar que el token esté siendo correctamente extraído
  
    // Hacer la solicitud para obtener los usuarios si el token está presente
    if (token) {
      axios.get(`${apiUrl}/api/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`, // Incluir el token en el encabezado
        },
      })
        .then((response) => {
          console.log("Respuesta de la API para usuarios:", response); // Verificar la respuesta completa de la API
          // Verificar si la respuesta es un array antes de establecer el estado
          const usuariosData = Array.isArray(response.data) ? response.data : [];
          console.log("Usuarios obtenidos:", usuariosData); // Verificar los usuarios obtenidos
          setUsuarios(usuariosData); // Establecer los usuarios en el estado
        })
        .catch((error) => {
          console.error('Error al obtener usuarios:', error); // Mostrar el error si ocurre
          setUsuarios([]); // Asegurarse de que los usuarios sean un array vacío en caso de error
        });
    } else {
      console.log('No se encontró el token, no se puede obtener los usuarios.');
      setUsuarios([]); // Limpiar el estado de usuarios si no se encuentra el token
    }
  
  }, []); // Este efecto solo se ejecuta una vez al cargar el componente

  // Obtener el usuario desde localStorage y sincronizar con los usuarios de la API
// Obtener el usuario desde localStorage y sincronizar con los usuarios de la API
useEffect(() => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (usuario) {
    setUsuarioLocal(usuario);

    if (usuarios.length > 0) {
      const usuarioAPI = usuarios.find(user => user.id === usuario.id); // 🔥 usar usuario.id
      if (usuarioAPI) {
        console.log('Usuario encontrado en API:', usuarioAPI.nombre);
      } else {
        console.log('Usuario no encontrado en la API');
      }
    }
  } else {
    console.log("No hay usuario en localStorage.");
  }
}, [usuarios]);




  



  // Obtener terrenos desde la API basados en la categoría
  const fetchTerrenos = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res   = await axios.get(`${apiUrl}/api/terrenos`, {
        headers:{ Authorization: `Bearer ${token}` }
      });
      setTerrenos(Array.isArray(res.data)? res.data : []);
    } catch (err) {
      console.error('Error al obtener terrenos:', err);
      setTerrenos([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);


useEffect(() => {
const socket = io(import.meta.env.VITE_API_URL, {
  auth: { token: localStorage.getItem('authToken') },
  transports: ["websocket"],
  withCredentials: true,
});


  socket.on("solicitudes-actualizadas", () => {
    console.log("🔁 Recibiendo actualización de solicitudes...");
    if (categoria === 'preseleccion') {
      fetchSolicitudes(); // no fetchTerrenos
    }
  });

  return () => socket.disconnect();
}, [categoria]);


useEffect(() => {
  const socket = io(import.meta.env.VITE_API_URL, {
    auth: { token: localStorage.getItem("authToken") },
    transports: ["websocket"],
    withCredentials: true,
  });

  socket.on("solicitudes-actualizadas", () => {
    console.log("🔁 Solicitudes actualizadas...");
    if (categoria === "inscripciones") {
      fetchSolicitudes(); // ⚡ Actualiza automáticamente la lista de solicitudes
    }
  });

  return () => socket.disconnect();
}, [categoria]);





  
  

  const getUsuarioDetails = (usuarioId) => {
    const usuario = usuarios.find(user => user.id === usuarioId);
    return usuario ? usuario.nombre : 'Usuario no encontrado';
  };

  const filteredTerrenos = terrenos.filter(terreno => {
    // Filtro por estado
    const estadoValido = filters.estado === 'todos' || terreno.estado === filters.estado;
  
    // Filtro por ubicación
    const ubicacionValida =
      !filters.ubicacion ||
      (terreno.ubicacion_lat?.toString().includes(filters.ubicacion) ||
       terreno.ubicacion_lon?.toString().includes(filters.ubicacion));
  
    // Filtro por texto
    const searchValido = terreno.titulo &&
      (terreno.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
       terreno.descripcion.toLowerCase().includes(filters.search.toLowerCase()));
  
    // Filtro por rango de checkbox
    const precio = terreno.precio;
    const rangoCheckboxValido = filters.rangos.length === 0 || filters.rangos.some(rango => {
      if (rango === '0-500') return precio >= 0 && precio <= 500;
      if (rango === '500-2000') return precio > 500 && precio <= 2000;
      if (rango === '2000-5000') return precio > 2000 && precio <= 5000;
      if (rango === '5000+') return precio > 5000;
      return false;
    });
  
    // Filtro por rango manual
 
    const precioMinOk = filters.precioMin === null || precio >= filters.precioMin;
    const precioMaxOk = filters.precioMax === null || precio <= filters.precioMax;
  
    // Filtro por calificación
    const calificacionValida = filters.calificacion === 'todas' || terreno.calificacion >= parseInt(filters.calificacion);
  
    // Filtro por moneda
    const monedaValida = filters.moneda === '' || terreno.moneda === filters.moneda;

    return precioMinOk && precioMaxOk && estadoValido && ubicacionValida && searchValido && rangoCheckboxValido && calificacionValida && monedaValida;
  });
  

  let sortedTerrenos = [...filteredTerrenos];

  // Ordenar según los filtros activados
  if (filters.masVistas) {
    sortedTerrenos.sort((a, b) => b.vistas - a.vistas);
  } else if (filters.masReacciones) {
    sortedTerrenos.sort((a, b) => b.reacciones - a.reacciones);
  } else if (filters.masCompartido) {
    sortedTerrenos.sort((a, b) => b.compartido - a.compartido);
  } else {
    // Orden por defecto: más recientes primero
    sortedTerrenos.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));
  }
  
  


const handleSubmit = async (e) => {
  e.preventDefault();

  if (!usuarioLocal) {
    toast.error("❌ Usuario no identificado.");
    return;
  }

  // Combinar datos del formulario
  const formToSend = {
    usuario_id: usuarioLocal.id,
    nombre_usuario: usuarioLocal.nombre,
    correo_usuario: usuarioLocal.correo,

    nombre_equipo: formData.nombreEquipo,
    nombre_representante: formData.nombreRepresentante,
    correo_contacto: formData.correo,
    tipo_documento: formData.tipoDocumento,
    numero_documento: formData.numeroDocumento,
    universidad: formData.universidad,
    departamento: formData.departamento,
    provincia: formData.provincia,
    distrito: formData.distrito,
    cantidad_integrantes: parseInt(formData.cantidadIntegrantes),
    tecnologias_usadas: formData.tecnologiasUsadas,
    nombre_proyecto: formData.nombreProyecto,
    descripcion_proyecto: formData.descripcionProyecto,
    acepta_terminos: formData.aceptaTerminos,
    participantes: formData.participantes
  };

  try {
    const token = localStorage.getItem("authToken");
    console.log("Token:", token);
    console.log("Formulario a enviar:", formToSend);

    const response = await axios.post(`${apiUrl}/api/solicitud`, formToSend, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("✅ Respuesta del servidor:", response.data);

    // ✅ Mostrar toast
    toast.success("✅ Inscripción enviada. Espera la revisión del administrador.");

    // ✅ Actualizar el estado local sin recargar la página
    const nuevaSolicitud = {
      id: response.data.id || Date.now(), // si el backend no devuelve ID
      usuario_id: usuarioLocal?.id,
      estado: "pendiente",
      nombre_equipo: formData.nombreEquipo,
      nombre_representante: formData.nombreRepresentante,
      universidad: formData.universidad,
      cantidad_integrantes: formData.cantidadIntegrantes,
      tecnologias_usadas: JSON.stringify(formData.tecnologiasUsadas),
      participantes: formData.participantes,
      fecha_registro: new Date().toISOString(),
    };

    // 🔹 Agrega la nueva solicitud al estado local
    setSolicitudes((prev) => [...prev, nuevaSolicitud]);

    // 🔹 Limpia el formulario
    setFormData({
      nombreEquipo: "",
      nombreRepresentante: "",
      correo: "",
      tipoDocumento: "DNI",
      numeroDocumento: "",
      universidad: "",
      departamento: "",
      provincia: "",
      distrito: "",
      cantidadIntegrantes: 1,
      tecnologiasUsadas: [],
      nombreProyecto: "",
      descripcionProyecto: "",
      aceptaTerminos: false,
      participantes: [],
    });

    // 🔹 Oculta el formulario si usas modal
    setShowForm(false);

  } catch (err) {
    console.error("❌ Error al enviar inscripción:", err.response ? err.response.data : err);
    toast.error("❌ Ocurrió un error al enviar la inscripción.");
  }
};

  

  const handleCreateTerreno = async (e) => {
    e.preventDefault();
  
    if (!usuarioLocal?.id) {
      console.error('No se encontró el ID del usuario.');
      return;
    }
  
    const formDataImagen = new FormData();
  
    // Agregar datos obligatorios
    formDataImagen.append('titulo', formData.titulo);
    formDataImagen.append('descripcion', formData.descripcion);
    formDataImagen.append('precio', formData.precio);
    formDataImagen.append('ubicacion_lat', formData.ubicacion_lat);
    formDataImagen.append('ubicacion_lon', formData.ubicacion_lon);
    formDataImagen.append('metros_cuadrados', formData.metros_cuadrados);
    formDataImagen.append('estado', formData.estado);
    formDataImagen.append('usuario_id', usuarioLocal.id);
  
    // Imagen principal (obligatoria)
    if (formData.imagenes) {
      formDataImagen.append('imagenes', formData.imagenes);
    }
  
    // Imágenes adicionales (opcionales)
    ['imagen_2', 'imagen_3', 'imagen_4'].forEach((key) => {
      if (formData[key]) {
        formDataImagen.append(key, formData[key]);
      }
    });
  
    // Video (opcional)
    if (formData.video) {
      formDataImagen.append('video', formData.video);
    }
  
    try {
      const response = await fetch(`${apiUrl}/Createterrenos`, {
        method: 'POST',
        body: formDataImagen,
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('Error al crear el terreno:', errorMessage);
        return;
      }
  
      const data = await response.json();
      console.log('Terreno creado exitosamente:', data);
      await fetchTerrenos(); // <-- Recarga los datos actualizados
  
      // Limpiar el formulario
      setFormData({
        tipoDocumento: 'DNI',
        numeroDocumento: '',
        emisionDocumento: '',
        celular: '',
        email: '',
        consentimiento: false,
        titulo: '',
        descripcion: '',
        precio: '',
        ubicacion_lat: '',
        ubicacion_lon: '',
        metros_cuadrados: '',
        imagenes: null,
        imagen_2: null,
        imagen_3: null,
        imagen_4: null,
        video: null,
        estado: 'disponible',
      });
  
      setShowForm(false); // Cerrar modal
  
      // Actualizar terrenos
      const terrenosActualizados = await axios.get(`${apiUrl}/api/terrenos`);
      setTerrenos(terrenosActualizados.data);
  
    } catch (error) {
      console.error('Error en la creación del terreno:', error);
    }
  };


  //PARA EDITAR EL TERRENO

  const [selectedTerreno, setSelectedTerreno] = useState(null);

  


  const handleUpdateTerreno = async (e) => {
    e.preventDefault();
  
    if (!usuarioLocal?.id || !selectedTerreno) {
      console.error('No se encontró el ID del usuario o terreno.');
      return;
    }
  
    const formDataImagen = new FormData();
    formDataImagen.append('titulo', formData.titulo);
    formDataImagen.append('descripcion', formData.descripcion);
    formDataImagen.append('precio', formData.precio);
    formDataImagen.append('ubicacion_lat', formData.ubicacion_lat);
    formDataImagen.append('ubicacion_lon', formData.ubicacion_lon);
    formDataImagen.append('metros_cuadrados', formData.metros_cuadrados);
    formDataImagen.append('estado', formData.estado);
    formDataImagen.append('usuario_id', usuarioLocal.id);
  
    if (formData.imagenes) {
      formDataImagen.append('imagenes', formData.imagenes);
    }
  
    ['imagen_2', 'imagen_3', 'imagen_4'].forEach((key) => {
      if (formData[key]) {
        formDataImagen.append(key, formData[key]);
      }
    });
  
    if (formData.video) {
      formDataImagen.append('video', formData.video);
    }
  
    try {
      const response = await fetch(`${apiUrl}/UpdateTerreno/${selectedTerreno.id}`, {
        method: 'PUT',
        body: formDataImagen,
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('Error al actualizar el terreno:', errorMessage);
        return;
      }
  
      const data = await response.json();
      console.log('Terreno actualizado exitosamente:', data);
      await fetchTerrenos();      // ← recarga la lista
      setShowForm(false);         // ← cierra el form
  
    } catch (error) {
      console.error('Error al actualizar el terreno:', error);
    }
  };
  
  
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [terrenoAEliminar, setTerrenoAEliminar] = useState(null);


  // Mostrar el formulario de confirmación
  const handleDeleteClick = (terreno) => {
    setTerrenoAEliminar(terreno); // Establecer el terreno a eliminar
    setIsConfirmOpen(true); // Mostrar el formulario de confirmación
  };


  // Confirmar la eliminación
  const confirmDelete = async () => {
    try {
      const res = await fetch(`${apiUrl}/DeleteTerreno/${terrenoAEliminar.id}`, {
        method: 'DELETE',
      });
  
      if (res.ok) {
        setTerrenos((prevTerrenos) =>
          prevTerrenos.filter((t) => t.id !== terrenoAEliminar.id)
        );
        console.log('Terreno eliminado');
  
        await fetchTerrenos(); // Ahora sí puedes usar await aquí
      }
    } catch (err) {
      console.error('Error eliminando terreno:', err);
    } finally {
      setIsConfirmOpen(false); // Cerrar el formulario de confirmación
    }
  };
  

  // Cancelar la eliminación
  const cancelDelete = () => {
    setIsConfirmOpen(false); // Cerrar el formulario de confirmación
    setTerrenoAEliminar(null); // Limpiar el terreno seleccionado
  };

  // Asegúrate de cerrar el modal si se hace clic fuera
  const handleClickOutside = (event) => {
    if (
      isConfirmOpen &&
      terrenoAEliminar &&
      !event.target.closest('.confirm-form') &&
      !event.target.closest('.delete-icon')
    ) {
      setIsConfirmOpen(false); // Cierra el modal si se hace clic fuera
      setTerrenoAEliminar(null); // Limpiar el terreno seleccionado
    }
  };

  // Usar useEffect para añadir el listener
  React.useEffect(() => {
    if (isConfirmOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // Limpiar el listener al desmontar
    };
  }, [isConfirmOpen]);



  const [showSolicitudes, setShowSolicitudes] = useState(false);

  const [solicitudes, setSolicitudes] = useState([]);

  const [error, setError] = useState(null);


  // Función para obtener solicitudes
  const fetchSolicitudes = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/solicitudes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Error al cargar solicitudes');
      }

      const data = await res.json();
      setSolicitudes(data);
    } catch (err) {
      setError('Hubo un error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  // Función para aprobar la solicitud
const aprobarSolicitud = async (id) => {
  setLoading(true);
  try {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${apiUrl}/api/verificarsolicitud`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ solicitud_id: id, estado: 'aprobada' }),
    });

    if (!res.ok) throw new Error('Error al aprobar');

    // ⏳ No esperamos correo — la respuesta llega rápido
    const updatedSolicitudes = solicitudes.map((s) =>
      s.id === id
        ? { ...s, estado: 'aprobada', fecha_respuesta: new Date().toLocaleString() }
        : s
    );
    setSolicitudes(updatedSolicitudes);
    toast.success('✅ Solicitud aprobada');
  } catch (err) {
    toast.error('❌ Error al aprobar la solicitud');
    console.error(err);
  } finally {
    setLoading(false);
  }
};


const rechazarSolicitud = async (id) => {
  try {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${apiUrl}/api/verificarsolicitud`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        solicitud_id: id,
        estado: 'rechazada',
      }),
    });

    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || 'Error al rechazar la solicitud');
    }

    const updatedSolicitudes = solicitudes.map((solicitud) =>
      solicitud.id === id
        ? { ...solicitud, estado: 'rechazada', fecha_respuesta: new Date().toLocaleString() }
        : solicitud
    );
    setSolicitudes(updatedSolicitudes);

    toast.success('🛑 Solicitud rechazada correctamente');
  } catch (err) {
    console.error(err);
    toast.error('❌ Hubo un error al rechazar la solicitud');
  } finally {
    setLoading(false);
  }
};
  
  


  
  
  
  


const renderVendedorView = () => {


  // Buscar la solicitud del usuario actual
  const solicitudUsuario = solicitudes.find(
    (s) => s.usuario_id === usuarioLocal?.id
  );

  // Estado de la solicitud: 'pendiente', 'aprobada', 'rechazada', o undefined si no hay
  const estado = solicitudUsuario?.estado;


  // Estado para el formulario del Pitch
  const [showPitchForm, setShowPitchForm] = useState(false);
  const [enlacePitch, setEnlacePitch] = useState('');
  const [resumen, setResumen] = useState('');
  const [impacto, setImpacto] = useState('');
  const [modelo, setModelo] = useState('');
  const [innovacion, setInnovacion] = useState('');
  const [pitch, setPitch] = useState(null);

  const [resultadosPublicados, setResultadosPublicados] = useState([]);

useEffect(() => {
  if (categoria === 'resultados') {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/resultados`)
      .then(res => {
        if (res.data.publicado) {
          setResultadosPublicados(res.data.resultados || []);
        } else {
          setResultadosPublicados([]); // aún no publicados
        }
      })
      .catch(err => console.error('Error al obtener resultados:', err));
  }
}, [categoria]);


  useEffect(() => {
  const fetchPitchGuardado = async () => {
    if (!usuarioLocal?.id) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pitch/ver/${usuarioLocal.id}`);
      if (res.data) {
        setPitch(res.data);
        setEnlacePitch(res.data.enlace_pitch || '');
        setResumen(res.data.resumen_proyecto || '');
        setImpacto(res.data.impacto_social || '');
        setModelo(res.data.modelo_negocio || '');
        setInnovacion(res.data.innovacion || '');
      }
    } catch (error) {
      console.error('Error al obtener el pitch guardado:', error);
    }
  };

  fetchPitchGuardado();
}, [usuarioLocal]);


  // Render de los círculos de fases
  const renderFases = () => {
    if (categoria !== "inscripciones") return null;

    const solicitudUsuario = solicitudes.find(
      (s) => s.usuario_id === usuarioLocal?.id
    );
    const estado = solicitudUsuario?.estado || "pendiente";

    return (
      <div className="fases-container">
        {/* Fase 1: Inscripción */}
        <div className={`fase ${estado === "pendiente" || estado === "aprobada" ? "activa" : ""}`}>
          <div className="circulo">1</div>
          <p>Inscripción</p>
        </div>

        {/* Fase 2: Preselección */}
        <div className={`fase ${estado === "aprobada" || estado === "finalista" ? "activa" : ""}`}>
          <div className="circulo">2</div>
          <p>Preselección</p>
        </div>

        {/* Fase 3: Final */}
        <div className={`fase ${estado === "finalista" ? "activa" : ""}`}>
          <div className="circulo">3</div>
          <p>Final</p>
        </div>

        {/* Rechazo */}
        {estado === "rechazada" && (
          <div className="fase rechazada">
            <div className="circulo">✖</div>
            <p>Rechazado</p>
          </div>
        )}
      </div>
    );
  };



  const renderResultadosPublicados = () => (
  <div className="resultados-finales-container">
    <h2>🏆 Resultados Finales de la Hackathon</h2>

    {resultadosPublicados.length === 0 ? (
      <p>🔒 Los resultados aún no han sido publicados. Vuelve más tarde.</p>
    ) : (
      <table className="tabla-resultados-publicos">
        <thead>
          <tr>
            <th>Puesto</th>
            <th>Equipo</th>
            <th>Universidad</th>
            <th>Innovación</th>
            <th>Impacto</th>
            <th>Modelo</th>
            <th>Promedio Total</th>
          </tr>
        </thead>
        <tbody>
          {resultadosPublicados.map((r, i) => (
            <tr key={r.pitch_id}>
              <td>🏅 {i + 1}</td>
              <td>{r.nombre_equipo}</td>
              <td>{r.universidad}</td>
              <td>{Number(r.prom_innovacion || 0).toFixed(2)}</td>
              <td>{Number(r.prom_impacto || 0).toFixed(2)}</td>
              <td>{Number(r.prom_modelo || 0).toFixed(2)}</td>
              <td><strong>{Number(r.prom_total || 0).toFixed(2)}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);


  // Render de la fase Inscripción: muestra el formulario
  const renderFaseInscripcion = () => (
    <div className="fase-container">
      <h2 className="fase-titulo">Fase 1: Inscripción</h2>
      <p>Completa el formulario para inscribirte en el Hackatón.</p>
      <div className="sell-form-container">
        <form className="hackathon-form" onSubmit={handleSubmit}>
          <h3>Formulario de Inscripción al Hackatón</h3>

          <label>Nombre del Equipo:</label>
          <input
            type="text"
            value={formData.nombreEquipo}
            onChange={(e) => setFormData({ ...formData, nombreEquipo: e.target.value })}
            required
          />

          <label>Nombre del Representante:</label>
          <input
            type="text"
            value={formData.nombreRepresentante}
            onChange={(e) => setFormData({ ...formData, nombreRepresentante: e.target.value })}
            required
          />

          <label>Correo Electrónico:</label>
          <input
            type="email"
            value={formData.correo}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
            required
          />

          <label>Tipo de Documento:</label>
          <select
            value={formData.tipoDocumento}
            onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
            required
          >
            <option value="">Seleccione un tipo</option>
            <option value="DNI">DNI</option>
            <option value="Carnet de Extranjería">Carnet de Extranjería</option>
          </select>

          <label>Número de Documento:</label>
          <input
            type="text"
            value={formData.numeroDocumento}
            onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
            required
          />

          <label>Universidad:</label>
          <input
            type="text"
            value={formData.universidad}
            onChange={(e) => setFormData({ ...formData, universidad: e.target.value })}
            required
          />

          <label>Departamento:</label>
          <input
            type="text"
            value={formData.departamento}
            onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
            required
          />

          <label>Provincia:</label>
          <input
            type="text"
            value={formData.provincia}
            onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
            required
          />

          <label>Distrito:</label>
          <input
            type="text"
            value={formData.distrito}
            onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
            required
          />

          <label>Cantidad de Integrantes:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.cantidadIntegrantes}
            onChange={(e) => setFormData({ ...formData, cantidadIntegrantes: e.target.value })}
            required
          />

          <label>Tecnologías a utilizar:</label>
          <select
            multiple
            value={formData.tecnologiasUsadas}
            onChange={(e) =>
              setFormData({
                ...formData,
                tecnologiasUsadas: Array.from(e.target.selectedOptions, (option) => option.value)
              })
            }
            required
          >
            <option value="IoT">IoT</option>
            <option value="IA">IA</option>
            <option value="Web">Sitio Web</option>
            <option value="App móvil">App móvil</option>
            <option value="Blockchain">Blockchain</option>
            <option value="Big Data">Big Data</option>
            <option value="Cloud">Cloud</option>
            <option value="Otros">Otros</option>
          </select>

          <label>Nombre del Proyecto:</label>
          <input
            type="text"
            value={formData.nombreProyecto}
            onChange={(e) => setFormData({ ...formData, nombreProyecto: e.target.value })}
            required
          />

          <label>Descripción del Proyecto:</label>
          <textarea
            value={formData.descripcionProyecto}
            onChange={(e) => setFormData({ ...formData, descripcionProyecto: e.target.value })}
            required
          />

          <label>Participantes (DNI y Nombre):</label>
          {formData.participantes.map((p, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder="DNI"
                value={p.dni}
                onChange={(e) => updateParticipante(index, 'dni', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Nombre completo"
                value={p.nombre}
                onChange={(e) => updateParticipante(index, 'nombre', e.target.value)}
                required
              />
            </div>
          ))}
          <button type="button" onClick={agregarParticipante}>Agregar Participante</button>

          <label>
            <input
              type="checkbox"
              checked={formData.aceptaTerminos}
              onChange={(e) => setFormData({ ...formData, aceptaTerminos: e.target.checked })}
              required
            />
            Acepto los términos de la política de seguridad del evento.
          </label>

          <button type="submit">Enviar Inscripción</button>
        </form>
      </div>
    </div>
  );

  // Render fase Preselección (aprobada)
  const renderFasePreseleccion = () => (
    <div className="fase-container">
      <h2 className="fase-titulo">Fase 2: Preselección</h2>
      <p>🎉 ¡Felicidades! Tu solicitud fue aprobada. Aquí tienes información importante:</p>
      <div className="contenido-preseleccion">
        <div className="card-preseleccion">
          <HackathonSchedule />
        </div>
        <div className="card-preseleccion">
          <h3>Bases del Evento</h3>
          <p>Descarga las bases:</p>
          <a href="/documentos/bases.pdf" target="_blank" rel="noopener noreferrer">Descargar Bases (PDF)</a>
        </div>
        <div className="card-preseleccion">
          <h3>Contacto</h3>
          <p>Si tienes dudas, envía un correo a: <strong>contacto@sateliteperu.com</strong></p>
        </div>
      </div>
    </div>
  );

  // Render fase Rechazo
  const renderFaseRechazo = () => (
    <div className="fase-container">
      <h2 className="fase-titulo">Gracias por participar</h2>
      <p>Lamentablemente tu solicitud fue rechazada. Te animamos a seguir participando en futuras ediciones.</p>
    </div>
  );

  //RENDER PARA EQUIPO APROBADOS PARA EL CONCURSO
const renderEquiposAprobados = () => {
  const aprobadosUnicos = Array.from(
    new Map(
      solicitudes
        .filter((s) => s.estado === 'aprobada')
        .map((s) => [s.usuario_id, s])
    ).values()
  );

  return (
    <div className="grid-aprobados">
      {aprobadosUnicos.map((solicitud, index) => (
        <div key={index} className="equipo-aprobado-wrapper">
          {/* Campo para subir Pitch (fuera del card) */}
          {solicitud.usuario_id === usuarioLocal?.id && (
            <div className="acciones-pitch">
              <input
                type="file"
                id={`pitch-${index}`}
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file || file.type !== 'application/pdf') {
                    alert('Solo se permite subir archivos PDF.');
                    return;
                  }
                  alert('📁 Pitch subido correctamente (solo guardado localmente por ahora)');
                }}
              />

              <button
                className="btn-formulario"
                onClick={() => {
                  if (pitch?.estado === 'enviado') {
                    alert('⚠️ Este formulario ya fue enviado definitivamente y no puede editarse.');
                    return;
                  }
                  setShowPitchForm(true);
                }}
              >
                📝 Completar Formulario
              </button>


              {pitch?.estado === 'enviado' ? (
                <span className="badge-enviado">✅ Enviado</span>
              ) : (
                <span className="badge-pendiente">🕓 Pendiente</span>
              )}
            </div>
          )}


          {/* Card del equipo */}
          <div className="card-aprobado">
            <h3>🎓 {solicitud.nombre_equipo}</h3>
            <p><strong>Representante:</strong> {solicitud.nombre_representante}</p>
            <p><strong>Tecnologías:</strong> {JSON.parse(solicitud.tecnologias_usadas || '[]').join(', ')}</p>
            <p><strong>N° Integrantes:</strong> {solicitud.cantidad_integrantes}</p>
            <ul>
              {(solicitud.participantes || []).map((p, i) => (
                <li key={i}>{p.nombre} ({p.dni})</li>
              ))}
            </ul>
          </div>
        </div>
      ))}

    {/* Modal para formulario del Pitch */}
{showPitchForm && (
  <div className="modal-backdrop">
    <div className="modal-formulario">
      <h3>Formulario del Proyecto</h3>
      {pitch?.estado === 'enviado' && (
        <div className="alerta-enviado">
          ⚠️ Este formulario fue enviado definitivamente. Solo lectura.
        </div>
      )}


      <label>🎥 Enlace del Pitch (YouTube o Drive):</label>
      <input
        type="text"
        placeholder="https://drive.google.com/..."
        value={enlacePitch}
        onChange={(e) => setEnlacePitch(e.target.value)}
        maxLength={200}
        required
        disabled={pitch?.estado === 'enviado'}
      />


      <label>📝 Resumen del proyecto (máx. 500 caracteres):</label>
      <textarea
        value={resumen}
        onChange={(e) => setResumen(e.target.value)}
        maxLength={500}
        required
        disabled={pitch?.estado === 'enviado'}
      />

      <label>🌍 Impacto social (máx. 400 caracteres):</label>
      <textarea
        value={impacto}
        onChange={(e) => setImpacto(e.target.value)}
        maxLength={400}
        required
        disabled={pitch?.estado === 'enviado'}
      />

      <label>💼 Modelo de negocio (máx. 400 caracteres):</label>
      <textarea
        value={modelo}
        onChange={(e) => setModelo(e.target.value)}
        maxLength={400}
        required
        disabled={pitch?.estado === 'enviado'}
      />

      <label>💡 Innovación (máx. 300 caracteres):</label>
      <textarea
        value={innovacion}
        onChange={(e) => setInnovacion(e.target.value)}
        maxLength={300}
        required
        disabled={pitch?.estado === 'enviado'}
      />

    <div className="botones-formulario">
      {pitch?.estado !== 'enviado' && (
        <>
          <button onClick={guardarBorrador} className="btn-guardar">💾 Guardar Cambios</button>
          <button onClick={enviarDefinitivo} className="btn-enviar">🚀 Enviar Definitivamente</button>
        </>
      )}
      <button onClick={() => setShowPitchForm(false)} className="btn-cerrar">Cerrar</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
  

};

const guardarBorrador = async () => {
  if (!enlacePitch || !resumen || !impacto || !modelo || !innovacion) {
    alert('⚠️ Completa todos los campos antes de guardar.');
    return;
  }

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/pitch/subir`, {
      solicitud_id: solicitudUsuario.id,
      usuario_id: usuarioLocal.id,
      enlace_pitch: enlacePitch,
      resumen_proyecto: resumen,
      impacto_social: impacto,
      modelo_negocio: modelo,
      innovacion: innovacion
    });

    alert('✅ Pitch guardado correctamente.');
    setPitch({ ...pitch, estado: 'borrador', id: res.data.id });
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || '❌ Error al guardar.');
  }
};

const enviarDefinitivo = async () => {
  if (pitch?.estado === 'enviado') {
    alert('⚠️ Este formulario ya fue enviado definitivamente.');
    return;
  }

  if (!pitch?.id) {
    alert('⚠️ Primero guarda el borrador antes de enviar.');
    return;
  }

  try {
    await axios.put(`${import.meta.env.VITE_API_URL}/api/pitch/enviar`, {
      usuario_id: usuarioLocal.id
    });
    alert('🚀 Enviado definitivamente. Ya no puedes editarlo.');
    setPitch({ ...pitch, estado: 'enviado' });
    setShowPitchForm(false);
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || '❌ Error al enviar.');
  }
};




  // Render principal
return (
  <div className={`dashboard ${darkMode ? 'dark' : 'light'}`}>
    {/* Botón abrir/cerrar sidebar en móviles */}
    <button className="sidebar-toggle" onClick={() => setSidebarActive(!sidebarActive)}>
      ☰
    </button>


    {/* Sidebar */}
    <div className={`sidebar ${sidebarActive ? 'active' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>

        {/* Botones arriba del sidebar */}
      <div className="sidebar-controls">
        <button className="collapse-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          {sidebarCollapsed ? '➡️' : '⬅️'}
        </button>

        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
      <div className="categories">

        {/* INSCRIPCIONES con subniveles */}
        <div className="category">
          <button
            className={`category-btn ${categoria === 'inscripciones' ? 'active' : ''}`}
            onClick={() => setOpenSub(prev => ({ ...prev, inscripciones: !prev.inscripciones }))}
          >
            <FaUserPlus className="icon" />
            {!sidebarCollapsed && <span>Inscripciones</span>}
          </button>
          {openSub.inscripciones && !sidebarCollapsed && (
            <div className="sublevel">
              <button onClick={() => { changeCategory('inscripciones'); setShowForm(true); }}>
                ➤ Nueva inscripción
              </button>
              <button onClick={() => changeCategory('listado-inscripciones')}>
                ➤ Listado
              </button>
            </div>
          )}
        </div>

        {/* PRESELECCIÓN */}
        <button
          className={`category-btn ${categoria === 'preseleccionados' ? 'active' : ''}`}
          onClick={() => changeCategory('preseleccion')}
        >
          <FaClipboardList className="icon" />
          {!sidebarCollapsed && <span>Preselección</span>}
        </button>

        {/* RESULTADOS */}
        <button
          className={`category-btn ${categoria === 'resultados' ? 'active' : ''}`}
          onClick={() => changeCategory('resultados')}
        >
          <FaCheck className="icon" />
          {!sidebarCollapsed && <span>Resultados</span>}
        </button>

        {/*{/* Carrusel de patrocinadores 
        {!sidebarCollapsed && (
          <div className="sponsor-carousel-container">
            <div className="sponsor-carousel">
              <div className="sponsor-track">
                {['cajahuancayo', 'oracle', 'huawei', 'microsoft', 'google'].map((logo, idx) => (
                  <React.Fragment key={idx}>
                    <img src={`/logos/${logo}.png`} alt={`Sponsor ${logo}`} />
                    <img src={`/logos/${logo}.png`} alt={`Sponsor ${logo} duplicado`} />
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}*/}

        {/* PRODUCTOS */}
        <button
          className={`category-btn ${categoria === 'productos' ? 'active' : ''}`}
          onClick={() => changeCategory('productos')}
        >
          <FaBox className="icon" />
          {!sidebarCollapsed && <span>Productos</span>}
        </button>
      </div>
    </div>

      {/* Main content */}
      <div className="main-content">
        {/* Vista bienvenida si no hay categoría seleccionada */}
        {(!categoria || categoria === '') && (
          <div className="welcome-message">
            <CountdownTimer />
           
            {/* Bloque de premios */}
            <div className="premios-container">
              <div className="premio-card primer-puesto">
                🥇 <strong>1er Puesto</strong>
                <p>💰 S/ 2000 + 🎓 Diplomas</p>
              </div>
              <div className="premio-card segundo-puesto">
                🥈 <strong>2do Puesto</strong>
                <p>💰 S/ 1000 + 🎓 Diplomas</p>
              </div>
              <div className="premio-card tercer-puesto">
                🥉 <strong>3er Puesto</strong>
                <p>💰 S/ 500 + 🎓 Diplomas</p>
              </div>
            </div>

            <h2>🚀 1ra Hackathon UNCP: Innovación para el Futuro</h2>
            <p>
              La Universidad Nacional del Centro del Perú lanza su <strong>primera Hackathon</strong>, un evento tecnológico que une a jóvenes talentos con el propósito de <strong>resolver desafíos sociales y ambientales</strong> mediante <strong>tecnologías emergentes</strong>, con un enfoque en <strong>desarrollo sostenible</strong> e impacto real.
            </p>

            <h3>🎯 Misión</h3>
            <p>
              Fomentar el talento tecnológico y creativo de nuestra comunidad universitaria, brindando un entorno colaborativo donde las ideas innovadoras se conviertan en soluciones con valor social, ambiental y económico.
            </p>

            <h3>🌄 Visión</h3>
            <p>
              Consolidar a la UNCP como un referente regional en innovación abierta, tecnología aplicada y compromiso con los <strong>Objetivos de Desarrollo Sostenible</strong>, impulsando proyectos escalables y con propósito.
            </p>

             <HackathonSchedule />
          </div>
          


        )}

        {/* INSCRIPCIONES */}
        {categoria === 'inscripciones' && (
           
          <>
          <CountdownTimer />
            {/* Fases circulares arriba */}
            {renderFases()}

            {/* Contenido según estado de solicitud */}
            {/* Si no hay solicitud aún: mostrar formulario */}
            {!solicitudUsuario && showForm && renderFaseInscripcion()}

            {/* Si ya envió y está pendiente: mensaje en espera */}
            {solicitudUsuario && estado === 'pendiente' && (
              <div className="fase-container">
                <h2 className="fase-titulo">Inscripción Enviada</h2>
                <p>✅ Tu solicitud está en espera de evaluación. Te notificaremos cuando haya respuesta.</p>
              </div>
            )}

            {/* Si aprobado: mostrar preselección */}
            {solicitudUsuario && estado === 'aprobada' && renderFasePreseleccion()}

            {/* Si rechazado: mostrar mensaje de agradecimiento */}
            {solicitudUsuario && estado === 'rechazada' && renderFaseRechazo()}
          </>
        )}

        {categoria === 'preseleccion' && renderEquiposAprobados()}

        {categoria === 'resultados' && renderResultadosPublicados()}


        <div className="contenido-dinamico">
          {categoria === 'productos' && <ProductosView />}
        </div>

        

        
      </div>

    </div>
  );

  
};

// RENDER PARA EQUIPOS APROBADOS PARA EL CONCURSO
const renderEquiposAprobados = () => {
  const aprobadosUnicos = Array.from(
    new Map(
      solicitudes
        .filter((s) => s.estado === 'aprobada')
        .map((s) => [s.usuario_id, s])
    ).values()
  );

  return (
    <div className="equipos-aprobados">
      {aprobadosUnicos.length === 0 ? (
        <p>No hay equipos aprobados todavía.</p>
      ) : (
        <table className="tabla-aprobados">
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Universidad</th>
              <th>Departamento</th>
              <th>Integrantes</th>
              <th>Fecha Aprobación</th>
            </tr>
          </thead>
          <tbody>
            {aprobadosUnicos.map((equipo) => (
              <tr key={equipo.usuario_id}>
                <td>{equipo.nombre_equipo}</td>
                <td>{equipo.universidad}</td>
                <td>{equipo.departamento}</td>
                <td>{equipo.cantidad_integrantes}</td>
                <td>{new Date(equipo.fecha_solicitud).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const [resultados, setResultados] = useState([]);
const [publicado, setPublicado] = useState(false);

useEffect(() => {
  if (categoria === 'resultados') {
    axios.get(`${import.meta.env.VITE_API_URL}/api/resultados`)
      .then(res => {
        setResultados(res.data.resultados || []);
        setPublicado(res.data.publicado);
      })
      .catch(err => console.error('Error al cargar resultados:', err));
  }
}, [categoria]);


const renderAdminView = () => (

  
  <div className="dashboard">
    <>
      {/* Notificaciones */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>

    {/* Botón de menú lateral */}
    <button
      className="sidebar-toggle"
      onClick={() => setSidebarActive(!sidebarActive)}
    >
      ☰
    </button>

    {/* SIDEBAR */}
    <div className={`sidebar ${sidebarActive ? 'active' : ''}`}>
      <div className="categories">
        <button
          className={`category-btn ${categoria === 'solicitudes' ? 'active' : ''}`}
          onClick={() => {
            changeCategory('solicitudes');
            setShowSolicitudes(true);
          }}
        >
          Solicitudes
        </button>

        <button
          className={`category-btn ${categoria === 'preseleccion' ? 'active' : ''}`}
          onClick={() => changeCategory('preseleccion')}
        >
          PRESELECCIÓN
        </button>

        <button
          className={`category-btn ${categoria === 'resultados' ? 'active' : ''}`}
          onClick={() => changeCategory('resultados')}
        >
          EVALUAR
        </button>
      </div>
    </div>

    {/* CONTENIDO PRINCIPAL */}
    <div className="main-content">
      {/* Vista inicial */}
      {categoria === undefined || categoria === '' ? (
        <div className="welcome-message">
          <h2>Vista Admin</h2>
          <CountdownTimer />
          <p>Bienvenido al panel de administración.</p>
        </div>
      ) : (
        <>
          {/* 🔹 TABLA DE SOLICITUDES */}
          {categoria === 'solicitudes' && showSolicitudes && (
            <div className="tabla-solicitudes-container">
              <div className="acciones-solicitudes">
                <button
                  onClick={() => exportarAExcel(solicitudes)}
                  className="btn-exportar"
                >
                  Exportar a Excel
                </button>
              </div>

              <table className="tabla-solicitudes">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Equipo</th>
                    <th>Universidad</th>
                    <th>Departamento</th>
                    <th>Integrantes</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((s) => (
                    <tr key={s.id}>
                      <td>{s.nombre_usuario}</td>
                      <td>{s.correo_usuario}</td>
                      <td>{s.nombre_equipo}</td>
                      <td>{s.universidad}</td>
                      <td>{s.departamento}</td>
                      <td>{s.cantidad_integrantes}</td>
                      <td className={`estado ${s.estado}`}>{s.estado}</td>
                      <td>{new Date(s.fecha_solicitud).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => aprobarSolicitud(s.id)}
                          className="btn-aprobar"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => rechazarSolicitud(s.id)}
                          className="btn-rechazar"
                        >
                          Rechazar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {loading && <div className="spinner">Cargando...</div>}
            </div>
          )}

          {/* 🔹 PRESELECCIÓN */}
          {categoria === 'preseleccion' && (
            <div className="equipos-aprobados-container">
              <h3>Equipos Aprobados</h3>
              {loading ? <p>Cargando...</p> : renderEquiposAprobados()}
            </div>
          )}

          {/* 🔹 EVALUAR */}
          {categoria === 'resultados' && (
            <div className="resultados-container">
              <h3>📊 Resultados Finales de la Hackathon</h3>

              <button
                className="btn-recargar"
                onClick={async () => {
                  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/resultados`);
                  setResultados(res.data.resultados || []);
                  setPublicado(res.data.publicado);
                }}
              >
                🔄 Recargar Resultados
              </button>

              {!publicado ? (
                <button
                  className="btn-publicar"
                  onClick={async () => {
                    if (!window.confirm("¿Publicar resultados definitivos?")) return;
                    await axios.put(`${import.meta.env.VITE_API_URL}/api/resultados/publicar`);
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/resultados`);
                    setResultados(res.data.resultados);
                    setPublicado(res.data.publicado);
                    alert("✅ Resultados publicados correctamente.");

                  }}
                >
                  📢 Publicar Resultados
                </button>
              ) : (
                <button
                  className="btn-republicar"
                  onClick={async () => {
                    if (!window.confirm("¿Quieres volver a publicar los resultados?")) return;
                    await axios.put(`${import.meta.env.VITE_API_URL}/api/resultados/publicar`);
                    alert("🔁 Resultados republicados correctamente.");
                  }}
                >
                  🔁 Republicar
                </button>
              )}

              <table className="tabla-resultados-finales">
                <thead>
                  <tr>
                    <th>Puesto</th>
                    <th>Equipo</th>
                    <th>Universidad</th>
                    <th>Innovación</th>
                    <th>Impacto</th>
                    <th>Modelo</th>
                    <th>Promedio Total</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.length === 0 ? (
                    <tr><td colSpan="7">No hay evaluaciones todavía.</td></tr>
                  ) : (
                    resultados.map((r, i) => (
                      <tr key={r.pitch_id}>
                        <td>{i + 1}</td>
                        <td>{r.nombre_equipo}</td>
                        <td>{r.universidad}</td>
                        <td>{Number(r.prom_innovacion || 0).toFixed(2)}</td>
                        <td>{Number(r.prom_impacto || 0).toFixed(2)}</td>
                        <td>{Number(r.prom_modelo || 0).toFixed(2)}</td>
                        <td><strong>{Number(r.prom_total || 0).toFixed(2)}</strong></td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </>
      )}
    </div>
  </div>
);

const renderJuradoView = () => {
  const [pitchs, setPitchs] = useState([]);
  const [evaluacion, setEvaluacion] = useState({});
  const [selectedPitch, setSelectedPitch] = useState(null);
  const [evaluados, setEvaluados] = useState([]); // equipos ya evaluados
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchPitchs = async () => {
    try {
      // Traemos todos los pitchs
      const resPitchs = await axios.get(`${import.meta.env.VITE_API_URL}/api/pitch/listar`);
      const unicos = Array.from(new Map(resPitchs.data.map(p => [p.usuario_id, p])).values());
      setPitchs(unicos);

      // Traemos todas las evaluaciones del jurado actual
      const resEval = await axios.get(`${import.meta.env.VITE_API_URL}/api/evaluaciones/jurado/${usuarioLocal.id}`);
      const pitchIdsEvaluados = resEval.data.map(ev => ev.pitch_id);
      setEvaluados(pitchIdsEvaluados);
    } catch (err) {
      console.error('Error al obtener pitchs o evaluaciones:', err);
    }
  };

  fetchPitchs();
}, []);


  const enviarEvaluacion = async () => {
    if (!selectedPitch) return alert("Selecciona un equipo para evaluar.");

    const { puntaje_innovacion, puntaje_impacto, puntaje_modelo, comentarios } = evaluacion;

    if (!puntaje_innovacion || !puntaje_impacto || !puntaje_modelo || !comentarios?.trim()) {
      return alert("⚠️ Completa todos los campos antes de enviar.");
    }

    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/evaluacion`, {
        jurado_id: usuarioLocal?.id,
        pitch_id: selectedPitch.pitch_id,
        puntaje_innovacion,
        puntaje_impacto,
        puntaje_modelo,
        comentarios,
      });

      alert("✅ Evaluación enviada correctamente.");

      // Marcar como evaluado
      setEvaluados(prev => [...prev, selectedPitch.pitch_id]);
      setEvaluacion({});
      setSelectedPitch(null);
    } catch (err) {
      console.error(err);
      alert("❌ Error al guardar evaluación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="evaluacion-jurado-container">
      <h2>🎓 Evaluación de Proyectos</h2>
      <p>
        Cada jurado debe leer la descripción del proyecto, ver el video Pitch y asignar una
        evaluación de acuerdo a los criterios establecidos. 
        <br />
        <strong>Deslice el control</strong> para valorar cada criterio y agregue un comentario general.
      </p>

      <table className="tabla-equipos-jurado">
        <thead>
          <tr>
            <th>Equipo</th>
            <th>Universidad</th>
            <th>Pitch</th>
            <th>Resumen</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {pitchs.length === 0 ? (
            <tr><td colSpan="6">No hay equipos disponibles.</td></tr>
          ) : (
            pitchs.map(p => (
              <tr key={p.pitch_id}>
                <td>{p.nombre_equipo || 'Sin nombre'}</td>
                <td>{p.universidad}</td>
                <td>
                  <a href={p.enlace_pitch} target="_blank" rel="noopener noreferrer">
                    🎥 Ver
                  </a>
                </td>
                <td>
                  <button onClick={() => setSelectedPitch(p)} className="btn-info">
                    📘 Ver Proyecto
                  </button>
                </td>
                <td>
                  {evaluados.includes(p.pitch_id) ? (
                    <span className="estado-evaluado">✅ Evaluado</span>
                  ) : (
                    <span className="estado-pendiente">⏳ Pendiente</span>
                  )}
                </td>
                <td>
                  {!evaluados.includes(p.pitch_id) && (
                    <button onClick={() => setSelectedPitch(p)} className="btn-evaluar">
                      Evaluar
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal de Evaluación */}
      {selectedPitch && (
        <div className="modal-backdrop">
          <div className="modal-evaluacion">
            <h3>🧾 Evaluando: {selectedPitch.nombre_equipo}</h3>
            <p><strong>🎓 Universidad:</strong> {selectedPitch.universidad}</p>
            <p><strong>📍 Departamento:</strong> {selectedPitch.departamento}</p>
            <p><strong>👥 Integrantes:</strong> {selectedPitch.cantidad_integrantes}</p>
            <p><strong>💡 Proyecto:</strong> {selectedPitch.resumen_proyecto}</p>

            <div className="criterios-evaluacion">
              <div>
                <label>💡 Innovación</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={evaluacion.puntaje_innovacion || 5}
                  onChange={(e) =>
                    setEvaluacion({ ...evaluacion, puntaje_innovacion: e.target.value })
                  }
                />
                <span>{["😐","🙂","😃","🤩","🏆"][Math.floor((evaluacion.puntaje_innovacion || 5)/2)-1]}</span>
              </div>

              <div>
                <label>🌍 Impacto Social</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={evaluacion.puntaje_impacto || 5}
                  onChange={(e) =>
                    setEvaluacion({ ...evaluacion, puntaje_impacto: e.target.value })
                  }
                />
                <span>{["😐","🙂","😃","🤩","🏆"][Math.floor((evaluacion.puntaje_impacto || 5)/2)-1]}</span>
              </div>

              <div>
                <label>💼 Modelo de Negocio</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={evaluacion.puntaje_modelo || 5}
                  onChange={(e) =>
                    setEvaluacion({ ...evaluacion, puntaje_modelo: e.target.value })
                  }
                />
                <span>{["😐","🙂","😃","🤩","🏆"][Math.floor((evaluacion.puntaje_modelo || 5)/2)-1]}</span>
              </div>
            </div>

            <label>🗒 Comentarios finales</label>
            <textarea
              placeholder="Escribe aquí una observación constructiva sobre el proyecto..."
              value={evaluacion.comentarios || ''}
              onChange={(e) => setEvaluacion({ ...evaluacion, comentarios: e.target.value })}
            />

            <div className="acciones-modal">
              <button onClick={enviarEvaluacion} className="btn-guardar" disabled={loading}>
                {loading ? "Guardando..." : "💾 Enviar Evaluación"}
              </button>
              <button onClick={() => setSelectedPitch(null)} className="btn-cerrar">
                ❌ Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




  return usuarioLocal && usuarioLocal.tipo
  ? usuarioLocal.tipo === 'admin'
    ? renderAdminView()
    : usuarioLocal.tipo === 'vendedor'
    ? renderVendedorView()
    : renderJuradoView()
  : null; // o podrías mostrar un loader o mensaje de acceso restringido

};

export default DashboardMain;
