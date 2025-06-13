import React, { useState, useEffect, useCallback, useRef } from 'react';

import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import "../styles/DashboardTerrenos.css";
import ImageCarousel from './ImageCarousel'; // Asegúrate de que la ruta sea correcta

//PARA LAS SOLICITUDES:




import { FacebookShareButton, TwitterShareButton, WhatsappShareButton } from 'react-share';
import { FacebookIcon, TwitterIcon, WhatsappIcon } from 'react-share';

const DashboardMain = () => {

// Estado para el índice del terreno que tiene abierto el menú de compartir
  const [activeShareIndex, setActiveShareIndex] = useState(null);
 
  const shareMenuRef = useRef(null); // Referencia al menú

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
  

  const [usuarioLocal, setUsuarioLocal] = useState(null);
  const apiUrl = process.env.NODE_ENV === 'production' 
  ? 'https://sateliterrreno-production.up.railway.app' 
  : 'http://localhost:5000';

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
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://sateliterrreno-production.up.railway.app'
      : 'http://localhost:5000';
  
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

  console.log("Usuario obtenido desde localStorage:", usuario); // Verifica que el usuario esté en localStorage

  if (usuario) {
    setUsuarioLocal(usuario);

    // Verificar que usuarios están cargados antes de hacer la búsqueda
    if (usuarios.length > 0) {
      console.log("Usuarios cargados desde la API:", usuarios);

      // Buscar el usuario en la lista de usuarios de la API usando id_estudiante
      const usuarioAPI = usuarios.find(user => user.id === usuario.id_estudiante); // Compara con id_estudiante

      if (usuarioAPI) {
        console.log('Tipo de usuario desde la API:', usuarioAPI.tipo); // Verifica el tipo del usuario
      } else {
        console.log('Usuario no encontrado en la API');
      }
    } else {
      console.log("Aún no se han cargado los usuarios desde la API.");
    }
  } else {
    console.log("No hay usuario en localStorage.");
  }
}, [usuarios]); // Este useEffect se ejecuta cuando `usuarios` cambia




  



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
    if (categoria==='terrenos') {
      fetchTerrenos();
    }
  }, [categoria, fetchTerrenos]);
  





  
  

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
    alert("Usuario no identificado.");
    return;
  }

  // Verifica los valores del formulario antes de enviarlos
  console.log("Datos del formulario:", formData);

  // Combina los datos del usuario logueado con los del formulario
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
    tecnologias_usadas: formData.tecnologiasUsadas, // array
    nombre_proyecto: formData.nombreProyecto,
    descripcion_proyecto: formData.descripcionProyecto,
    acepta_terminos: formData.aceptaTerminos,

    // Participantes es un array de objetos { dni, nombre }
    participantes: formData.participantes
  };

  // Verifica campos requeridos
  for (const key in formToSend) {
    if (
      formToSend[key] === "" ||
      formToSend[key] === null ||
      formToSend[key] === undefined ||
      (Array.isArray(formToSend[key]) && formToSend[key].length === 0)
    ) {
      console.warn(`Falta el campo: ${key}`);
    }
  }

  try {
    const token = localStorage.getItem("authToken");

    console.log("Token:", token);
    console.log("Formulario a enviar:", formToSend);

    const response = await axios.post(`${apiUrl}/api/solicitud`, formToSend, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Respuesta del servidor:", response.data);
    alert("Inscripción enviada con éxito.");
    // Opcional: limpiar formulario o redireccionar
  } catch (err) {
    console.error("Error al enviar inscripción:", err.response ? err.response.data : err);
    alert("Ocurrió un error al enviar la inscripción.");
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
          estado: 'aprobada',
        }),
      });

      if (!res.ok) {
        throw new Error('Error al aprobar la solicitud');
      }

      const updatedSolicitudes = solicitudes.map((solicitud) =>
        solicitud.id === id
          ? { ...solicitud, estado: 'aprobada', fecha_respuesta: new Date().toLocaleString() }
          : solicitud
      );
      setSolicitudes(updatedSolicitudes);

      alert('Solicitud aprobada');
    } catch (err) {
      setError('Hubo un error al aprobar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Función para rechazar la solicitud
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
        throw new Error('Error al rechazar la solicitud');
      }

      const updatedSolicitudes = solicitudes.map((solicitud) =>
        solicitud.id === id
          ? { ...solicitud, estado: 'rechazado', fecha_respuesta: new Date().toLocaleString() }
          : solicitud
      );
      setSolicitudes(updatedSolicitudes);

      alert('Solicitud rechazada');
    } catch (err) {
      setError('Hubo un error al rechazar la solicitud');
    } finally {
      setLoading(false);
    }
  };
  
  


  
  
  
  


  const renderCompradorView = () => (
    <div className="dashboard">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarActive(!sidebarActive)} // Cambiar el estado de la barra lateral
      >
        ☰
      </button>
      <div className={`sidebar ${sidebarActive ? 'active' : ''}`}>
        <div className="categories">
          <button
            className={`category-btn ${categoria === 'terrenos' ? 'active' : ''}`}
            onClick={() => { changeCategory('terrenos'); }}
          >
            Terrenos
          </button>
          <button
            className={`category-btn ${categoria === 'carros' ? 'active' : ''}`}
            onClick={() => { changeCategory('carros'); }}
          >
            Carros
          </button>
          <button
            className={`category-btn ${categoria === 'casas' ? 'active' : ''}`}
            onClick={() => { changeCategory('casas'); }}
          >
            Casas
          </button>

          <button
            className={`category-btn ${categoria === 'departamentos' ? 'active' : ''}`}
            onClick={() => { changeCategory('departamentos'); }}
          >
            Departamentos
          </button>

          <button
            className={`category-btn ${categoria === 'ropa' ? 'active' : ''}`}
            onClick={() => { changeCategory('ropa'); }}
          >
            Ropa
          </button>

          <button
            className={`category-btn ${categoria === 'celulares' ? 'active' : ''}`}
            onClick={() => { changeCategory('celulares'); }}
          >
            Celulares
          </button>
        
          <button
            className={`category-btn ${categoria === 'vender' ? 'active' : ''}`}
            onClick={() => { changeCategory('vender'); setShowForm(true)}}

            
          >
            INSCRIPCIONES
          </button>
        </div>
      </div>

      <div className="main-content">
        {categoria === undefined || categoria === '' ? (
          <div className="welcome-message">
            <h3>SATELITE PERÚ</h3>
            <p>Bienvenido a nuestro sitio oficial. Aquí puedes encontrar diversos terrenos, casas, y carros a la venta. Si deseas vender, puedes utilizar nuestro formulario de conformidad.</p>
            <p>Explora las categorías disponibles y encuentra lo que necesitas.</p>

            <h3>MISIÓN</h3>
            <p>Brindar a nuestros clientes una plataforma confiable, ágil y segura para la compra y venta de propiedades y vehículos, conectando personas con oportunidades reales en todo el Perú.</p>

            <h3>VISIÓN</h3>
            <p>Ser el portal líder en el mercado peruano de bienes raíces y automóviles, destacando por nuestra transparencia, innovación tecnológica y compromiso con la satisfacción del cliente.</p>
          </div>
        ) : showForm ? (
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

        ) : (
          <>
            {categoria === 'terrenos' && (
              <div className={`filters ${sidebarActive ? 'active' : ''}`}>
                <div className="filter-item">
                  <select
                    value={filters.estado}
                    onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                    className="filter-select"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="disponible">Disponible</option>
                    <option value="vendido">Vendido</option>
                  </select>
                </div>
                {usuarioLocal?.rol === 'vendedor' && (
                  <>
                    <BotonAgregarProducto />
                    <MisProductos />
                  </>
                )}

                <div className="filter-item">
                  <input
                    type="text"
                    placeholder="Ubicación"
                    value={filters.ubicacion}
                    onChange={(e) => setFilters({ ...filters, ubicacion: e.target.value })}
                    className="filter-input"
                  />
                </div>

                <div className="filter-item">
                  <input
                    type="number"
                    placeholder="Precio mínimo"
                    value={filters.precioMin}
                    onChange={(e) => setFilters({ ...filters, precioMin: Math.max(0, e.target.value) })}
                    className="filter-input"
                  />
                </div>

                <div className="filter-item">
                  <input
                    type="number"
                    placeholder="Precio máximo"
                    value={filters.precioMax}
                    onChange={(e) => setFilters({ ...filters, precioMax: Math.max(filters.precioMin, e.target.value) })}
                    className="filter-input"
                  />
                </div>

                <div className="filter-item">
                  <select
                    value={filters.moneda}
                    onChange={(e) => setFilters({ ...filters, moneda: e.target.value })}
                    className="filter-select"
                  >
                    <option value="soles">Soles</option>
                    <option value="dolares">Dólares</option>
                  </select>
                </div>
              </div>
            )}

            <div className="gallery">
              {loading ? (
                <p>Cargando datos...</p>
              ) : categoria === 'terrenos' ? (
                sortedTerrenos.map((terreno, index) => {
                  //const imagenUrl = terreno.imagenes && Array.isArray(terreno.imagenes) ? `/terrenos/${terreno.imagenes[0]}` : '/default-image.jpg';
                  const vendedorNombre = getUsuarioDetails(terreno.usuario_id);
                  
                  return (
                    <div key={index} className="card">
                      <div className="card-image-container">
                      <ImageCarousel terreno={terreno} apiUrl={apiUrl} />
                        <h3 className="card-title">{terreno.titulo}</h3>
                      </div>
                      <div
                        key={index}
                        className="card-details"
                        ref={el => detailRefs.current[index] = el}
                      >


                      {/* Corazón */}

                        <i
                          className={`fas fa-heart heart-icon ${liked[index] ? 'liked' : ''}`}
                          onClick={(e) => {
                            const willLike = !liked[index];
                            toggleLike(index);
                            if (willLike) burstHearts(index, e);
                          }}
                        />            



                      <p className="card-price">
                          {filters.moneda === 'soles' ? `S/ ${terreno.precio}` : `$ ${terreno.precio}`}
                      </p>

                      {/* Ojito */}

                      <i className="fas fa-eye view-icon"/>

                      <i
                        className="fas fa-share-alt share-icon"
                        onClick={() => handleShare(index)} 
                      />

                            {/* Mostrar el menú de compartir cuando showShareMenu sea true */}
                            {activeShareIndex === index &&(
                              <div className="share-menu" ref={shareMenuRef}> {/* <-- aquí va el ref */}
                                <FacebookShareButton url={url} quote={text}>
                                  <FacebookIcon size={28} round />
                                </FacebookShareButton>
                                <TwitterShareButton url={url} title={text}>
                                  <TwitterIcon size={28} round />
                                </TwitterShareButton>
                                <WhatsappShareButton url={url} title={text}>
                                  <WhatsappIcon size={28} round />
                                </WhatsappShareButton>
                              </div>
                            )}



                        <p className="card-location">
                          <i className="fas fa-location-pin"></i> Lat: {terreno.ubicacion_lat}, Lon: {terreno.ubicacion_lon}
                        </p>
                        <p className="card-estado"><strong>Estado:</strong> {terreno.estado}</p>
                        <p className="card-vendedor"><strong>Vendedor:</strong> {vendedorNombre}</p>
                        <Link to={`/dashboard/terrenos/${terreno.id}`} target="_blank" rel="noopener noreferrer" className="card-button">Ver más</Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No hay datos disponibles para esta categoría.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderAdminView = () => (
    <div className="dashboard">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarActive(!sidebarActive)} // Cambiar el estado de la barra lateral
      >
        ☰
      </button>
      <div className={`sidebar ${sidebarActive ? 'active' : ''}`}>
        <div className="categories">
          <button
            className={`category-btn ${categoria === 'terrenos' ? 'active' : ''}`}
            onClick={() => { changeCategory('terrenos'); }}
          >
            Terrenos
          </button>
          <button
            className={`category-btn ${categoria === 'carros' ? 'active' : ''}`}
            onClick={() => { changeCategory('carros'); }}
          >
            Carros
          </button>
          <button
            className={`category-btn ${categoria === 'casas' ? 'active' : ''}`}
            onClick={() => { changeCategory('casas'); }}
          >
            Casas
          </button>

          <button
            className={`category-btn ${categoria === 'departamentos' ? 'active' : ''}`}
            onClick={() => { changeCategory('departamentos'); }}
          >
            Departamentos
          </button>

          <button
            className={`category-btn ${categoria === 'ropa' ? 'active' : ''}`}
            onClick={() => { changeCategory('ropa'); }}
          >
            Ropa
          </button>

          <button
            className={`category-btn ${categoria === 'celulares' ? 'active' : ''}`}
            onClick={() => { changeCategory('celulares'); }}
          >
            Celulares
          </button>

          <button
            className={`category-btn${categoria === 'solicitudes' ? 'active' : ''}`}
              onClick={() => {changeCategory('solicitudes');
                setShowSolicitudes(true);}}
          >
            Solicitudes
          </button>


        </div>
      </div>

      <div className="main-content">
        {categoria === undefined || categoria === '' ? (
          <div className="welcome-message">
            <h2>Vista Admin</h2>
            <p>Bienvenido al panel de administración.</p>
          </div>
        ) : showForm ? (
          <div className="modal">

            
            <form onSubmit={editMode ? handleUpdateTerreno : handleCreateTerreno} className="form-grid">
              {/* Campo 1 */}
              <div>
                <label htmlFor="titulo">Título:</label>
                <input type="text" id="titulo" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} required />
              </div>
      
              <div className="form-group-full">
                <label htmlFor="descripcion">Descripción:</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                ></textarea>
              </div>


      
              <div>
                <label htmlFor="precio">Precio:</label>
                <input type="number" id="precio" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} required />
              </div>
      
              <div>
                <label htmlFor="ubicacion_lat">Latitud:</label>
                <input type="number" id="ubicacion_lat" step="any" value={formData.ubicacion_lat} onChange={(e) => setFormData({ ...formData, ubicacion_lat: e.target.value })} required />
              </div>
      
              <div>
                <label htmlFor="ubicacion_lon">Longitud:</label>
                <input type="number" id="ubicacion_lon" step="any" value={formData.ubicacion_lon} onChange={(e) => setFormData({ ...formData, ubicacion_lon: e.target.value })} required />
              </div>
      
              <div>
                <label htmlFor="metros_cuadrados">Metros cuadrados:</label>
                <input type="number" id="metros_cuadrados" value={formData.metros_cuadrados} onChange={(e) => setFormData({ ...formData, metros_cuadrados: e.target.value })} required />
              </div>
      
              <div>
                <label htmlFor="imagenes">Imagen 1:</label>
                <input type="file" id="imagenes" accept="image/*" onChange={(e) => setFormData({ ...formData, imagenes: e.target.files[0] })} required />
              </div>
      
              <div>
                <label htmlFor="imagen_2">Imagen 2:</label>
                <input type="file" id="imagen_2" accept="image/*" onChange={(e) => setFormData({ ...formData, imagen_2: e.target.files[0] })} />
              </div>
      
              <div>
                <label htmlFor="imagen_3">Imagen 3:</label>
                <input type="file" id="imagen_3" accept="image/*" onChange={(e) => setFormData({ ...formData, imagen_3: e.target.files[0] })} />
              </div>
      
              <div>
                <label htmlFor="imagen_4">Imagen 4:</label>
                <input type="file" id="imagen_4" accept="image/*" onChange={(e) => setFormData({ ...formData, imagen_4: e.target.files[0] })} />
              </div>
      
              <div>
                <label htmlFor="video">Video:</label>
                <input type="file" id="video" accept="video/*" onChange={(e) => setFormData({ ...formData, video: e.target.files[0] })} />
              </div>
      
              <div>
                <label htmlFor="estado">Estado:</label>
                <select id="estado" value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })}>
                  <option value="disponible">Disponible</option>
                  <option value="vendido">Vendido</option>
                </select>
              </div>
      
              {/* BOTONES */}
              <div className="form-actions">
                <button type="submit">{editMode ? 'Actualizar' : 'Guardar Terreno'}</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
              </div>
            </form>
          </div>

        ) : (
          <>
          {categoria === 'solicitudes' && showSolicitudes && (
            <div className="solicitudes-cards-container">
              <h2>Solicitudes</h2>
              <div className="cards-grid">
                {solicitudes.map((solicitud) => (
                  <div key={solicitud.id} className="solicitud-card">
                    <p><strong>Nombre:</strong> {solicitud.nombre}</p>
                    <p><strong>Correo:</strong> {solicitud.correo}</p>
                    <p><strong>Tipo DOC:</strong> {solicitud.tipo_documento}</p>
                    <p><strong>Documento:</strong> {solicitud.numero_documento}</p>
                    <p><strong>Estado:</strong> {solicitud.estado}</p>
                    <p><strong>Fecha Solicitud:</strong> {solicitud.fecha_solicitud}</p>
                    <p><strong>Fecha Respuesta:</strong> {solicitud.fecha_respuesta}</p>
                    <div className="acciones">
                      <button onClick={() => aprobarSolicitud(solicitud.id)} className="btn-aprobar">Aprobar</button>
                      <button onClick={() => rechazarSolicitud(solicitud.id)} className="btn-rechazar">Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


            {categoria === 'terrenos' && (
              <div className="filters">
              {/* Filtro por estado */}
              <div className="filter-item">
                <select
                  value={filters.estado}
                  onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                  className="filter-select"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="disponible">Disponible</option>
                  <option value="vendido">Vendido</option>
                </select>
              </div>

              {/* Filtro por ubicación */}
              <div className="filter-item">
                <input
                  type="text"
                  placeholder="Ubicación"
                  value={filters.ubicacion}
                  onChange={(e) => setFilters({ ...filters, ubicacion: e.target.value })}
                  className="filter-input"
                />
              </div>

              {/* Filtros de rango por checkbox */}
              <div className="filter-item">
                <label><input type="checkbox" checked={filters.rangos.includes('0-500')} onChange={() => toggleRango('0-500')} /> S/ 0 - 500</label>
                <label><input type="checkbox" checked={filters.rangos.includes('500-2000')} onChange={() => toggleRango('500-2000')} /> S/ 500 - 2000</label>
                <label><input type="checkbox" checked={filters.rangos.includes('2000-5000')} onChange={() => toggleRango('2000-5000')} /> S/ 2000 - 5000</label>
                <label><input type="checkbox" checked={filters.rangos.includes('5000+')} onChange={() => toggleRango('5000+')} /> Desde S/ 5000</label>
              </div>

              {/* Precio manual */}
              <div className="filter-item">
              <input
                type="number"
                placeholder="Precio mínimo"
                value={filters.precioMin === null ? '' : filters.precioMin}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    precioMin: e.target.value === '' ? null : parseFloat(e.target.value)
                  })
                }
                className="filter-input"
              />
            </div>

            <div className="filter-item">
              <input
                type="number"
                placeholder="Precio máximo"
                value={filters.precioMax === null ? '' : filters.precioMax}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    precioMax: e.target.value === '' ? null : parseFloat(e.target.value)
                  })
                }
                className="filter-input"
              />
            </div>

              {/* Moneda */}
              <div className="filter-item">
                <select
                  value={filters.moneda}
                  onChange={(e) => setFilters({ ...filters, moneda: e.target.value })}
                  className="filter-select"
                >
                  <option value="soles">Soles</option>
                  <option value="dolares">Dólares</option>
                </select>
              </div>

              {/* Filtro por calificación */}
              <div className="filter-item">
                <select
                  value={filters.calificacion}
                  onChange={(e) => setFilters({ ...filters, calificacion: e.target.value })}
                  className="filter-select"
                >
                  <option value="todas">Todas las calificaciones</option>
                  <option value="5">5 estrellas</option>
                  <option value="4">4 estrellas o más</option>
                  <option value="3">3 estrellas o más</option>
                </select>
              </div>

              {/* Filtros de popularidad */}
              <div className="filter-item">
                <label>
                  <input
                    type="checkbox"
                    checked={filters.masVistas}
                    onChange={(e) => setFilters({ ...filters, masVistas: e.target.checked })}
                  />
                  Más vistas
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={filters.masReacciones}
                    onChange={(e) => setFilters({ ...filters, masReacciones: e.target.checked })}
                  />
                  Más reacciones
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={filters.masCompartido}
                    onChange={(e) => setFilters({ ...filters, masCompartido: e.target.checked })}
                  />
                  Más compartido
                </label>

              </div>

            </div>
            )}

            {/* Botón Agregar solo visible para admin en la categoría terrenos */}
            {usuarioLocal && usuarioLocal.tipo === 'admin' && categoria === 'terrenos' && (
            <div className="filters">
              <button
                className="add-button"
                onClick={() => {
                  setShowForm(true); // Mostrar el formulario
                  setEditMode(false); // Establecer el modo de agregar (vacío)
                  setFormData({ // Limpiar los campos del formulario
                    titulo: '',
                    descripcion: '',
                    precio: '',
                    ubicacion_lat: '',
                    ubicacion_lon: '',
                    metros_cuadrados: '',
                    estado: 'disponible',
                    imagenes: null, // Inicializar las imágenes como null
                    imagen_2: null,
                    imagen_3: null,
                    imagen_4: null,
                    video: null,
                  });
                }}
              >
                Agregar Terreno
              </button>
            </div>
            )}

            <div className="gallery">
              {categoria === 'terrenos' && loading ? (
                <p>Cargando datos...</p>
              ) : categoria === 'terrenos' ?  (
                sortedTerrenos.map((terreno, index) => {
                  const imagenUrl = terreno.imagenes && Array.isArray(terreno.imagenes) ? terreno.imagenes[0] : '/default-image.jpg';
                  const vendedorNombre = getUsuarioDetails(terreno.usuario_id);
                  return (
                    <div key={index} className="card">
                    <div className="card-image-container">
                      <ImageCarousel terreno={terreno} apiUrl={apiUrl} />
                      <h3 className="card-title">{terreno.titulo}</h3>

                      {/* Íconos de editar y eliminar */}
                      <div key={index} className="icon-buttons">
                        <i
                          className="fas fa-edit edit-icon"
                          onClick={() => {
                            setShowForm(true); // Mostrar el formulario
                            setEditMode(true); // Establecer el modo de edición
                            setFormData({ // Llenar el formulario con los datos del terreno a editar
                              titulo: terreno.titulo,
                              descripcion: terreno.descripcion,
                              precio: terreno.precio,
                              ubicacion_lat: terreno.ubicacion_lat,
                              ubicacion_lon: terreno.ubicacion_lon,
                              metros_cuadrados: terreno.metros_cuadrados,
                              estado: terreno.estado,
                              imagenes: terreno.imagenes,
                              imagen_2: terreno.imagen_2,
                              imagen_3: terreno.imagen_3,
                              imagen_4: terreno.imagen_4,
                              video: terreno.video
                            });
                            setSelectedTerreno(terreno); // Asegúrate de guardar el terreno seleccionado
                          }}
                        ></i>
                        
                        <i
                          className="fas fa-trash delete-icon"
                          onClick={() => handleDeleteClick(terreno)}
                        ></i>
                      </div>

                    </div>
                    


                    <div
                        key={index}
                        className="card-details"
                        ref={el => detailRefs.current[index] = el}
                      >


                      {/* Corazón */}

                        <i
                          className={`fas fa-heart heart-icon ${liked[index] ? 'liked' : ''}`}
                          onClick={(e) => {
                            const willLike = !liked[index];
                            toggleLike(index);
                            if (willLike) burstHearts(index, e);
                          }}
                        />    


                        
                                



                      <p className="card-price">
                          {filters.moneda === 'soles' ? `S/ ${terreno.precio}` : `$ ${terreno.precio}`}
                      </p>

                      {/* Ojito */}

                      <i className="fas fa-eye view-icon"/>

                      <i
                        className="fas fa-share-alt share-icon"
                        onClick={() => handleShare(index)} 
                      />

                            {/* Mostrar el menú de compartir cuando showShareMenu sea true */}
                            {activeShareIndex === index &&(
                              <div className="share-menu" ref={shareMenuRef}> {/* <-- aquí va el ref */}
                                <FacebookShareButton url={url} quote={text}>
                                  <FacebookIcon size={28} round />
                                </FacebookShareButton>
                                <TwitterShareButton url={url} title={text}>
                                  <TwitterIcon size={28} round />
                                </TwitterShareButton>
                                <WhatsappShareButton url={url} title={text}>
                                  <WhatsappIcon size={28} round />
                                </WhatsappShareButton>
                              </div>
                            )}



                        <p className="card-location">
                          <i className="fas fa-location-pin"></i> Lat: {terreno.ubicacion_lat}, Lon: {terreno.ubicacion_lon}
                        </p>
                        <p className="card-estado"><strong>Estado:</strong> {terreno.estado}</p>
                        <p className="card-vendedor"><strong>Vendedor:</strong> {vendedorNombre}</p>
                        <Link to={`/dashboard/terrenos/${terreno.id}`} target="_blank" rel="noopener noreferrer" className="card-button">Ver más</Link>
                      </div>
                      
                      
                          

                    </div>
                    
                    
                  );
                })
                
              ) : null}

              
            
              {/* ✅ Modal global fuera del .map() */}
              {isConfirmOpen && terrenoAEliminar && (
                <div className="modal-backdrop">
                  <div className="confirm-form">
                    <p>¿Deseas eliminar el terreno: "{terrenoAEliminar.titulo}"?</p>
                    <div className="confirm-buttons">
                      <button onClick={confirmDelete}>Eliminar</button>
                      <button onClick={cancelDelete}>Cancelar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderVendedorView = () => (
    <div className="dashboard">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarActive(!sidebarActive)} // Cambiar el estado de la barra lateral
      >
        ☰
      </button>
      <div className={`sidebar ${sidebarActive ? 'active' : ''}`}>
        <div className="categories">
          <button
            className={`category-btn ${categoria === 'terrenos' ? 'active' : ''}`}
            onClick={() => { changeCategory('terrenos'); }}
          >
            Terrenos
          </button>
          <button
            className={`category-btn ${categoria === 'carros' ? 'active' : ''}`}
            onClick={() => { changeCategory('carros'); }}
          >
            Carros
          </button>
          <button
            className={`category-btn ${categoria === 'casas' ? 'active' : ''}`}
            onClick={() => { changeCategory('casas'); }}
          >
            Casas
          </button>

          <button
            className={`category-btn ${categoria === 'departamentos' ? 'active' : ''}`}
            onClick={() => { changeCategory('departamentos'); }}
          >
            Departamentos
          </button>

          <button
            className={`category-btn ${categoria === 'ropa' ? 'active' : ''}`}
            onClick={() => { changeCategory('ropa'); }}
          >
            Ropa
          </button>

          <button
            className={`category-btn ${categoria === 'celulares' ? 'active' : ''}`}
            onClick={() => { changeCategory('celulares'); }}
          >
            Celulares
          </button>
        
          <button
            className={`category-btn ${categoria === 'vender' ? 'active' : ''}`}
            onClick={() => { changeCategory('vender'); setShowForm(true)}}

            
          >
            ¿Quieres vender?
          </button>
        </div>
      </div>

      <div className="main-content">
        {categoria === undefined || categoria === '' ? (
          <div className="welcome-message">
            <h3>SATELITE PERÚ Ahora puedes vender en cualquier categoría</h3>
            <p>Bienvenido a nuestro sitio oficial. Aquí puedes encontrar diversos terrenos, casas, y carros a la venta. Si deseas vender, puedes utilizar nuestro formulario de conformidad.</p>
            <p>Explora las categorías disponibles y encuentra lo que necesitas.</p>

            <h3>MISIÓN</h3>
            <p>Brindar a nuestros clientes una plataforma confiable, ágil y segura para la compra y venta de propiedades y vehículos, conectando personas con oportunidades reales en todo el Perú.</p>

            <h3>VISIÓN</h3>
            <p>Ser el portal líder en el mercado peruano de bienes raíces y automóviles, destacando por nuestra transparencia, innovación tecnológica y compromiso con la satisfacción del cliente.</p>
          </div>
        ) : showForm ? (
        <div className="sell-form-container">
          <form className="sell-form" onSubmit={handleSubmit}>
            <h3>Solicitud para ser Vendedor</h3>
            <p>
              Para poder vender en nuestra plataforma, requerimos tus datos reales y una aceptación expresa
              de nuestras condiciones. Tu solicitud será revisada por nuestro equipo antes de ser aprobada.
            </p>

            <label htmlFor="tipoDocumento">Tipo de Documento:</label>
            <select
              id="tipoDocumento"
              value={vendedorFormData.tipoDocumento}
              onChange={(e) => setVendedorFormData({ ...vendedorFormData, tipoDocumento: e.target.value })}
              required
            >
              <option value="">Seleccione un tipo</option>
              <option value="DNI">DNI</option>
              <option value="RUC">RUC</option>
              <option value="Carnet Extranjero">Carnet de Extranjería</option>
            </select>

            <label htmlFor="numeroDocumento">Número de Documento:</label>
            <input
              type="text"
              id="numeroDocumento"
              placeholder={`Ingrese su ${vendedorFormData.tipoDocumento || 'documento'}`}
              value={vendedorFormData.numeroDocumento}
              onChange={(e) => setVendedorFormData({ ...vendedorFormData, numeroDocumento: e.target.value })}
              required
            />

            <div className="legal-terms">
              <h4>Términos y Condiciones del Vendedor</h4>
              <p>
                Al aceptar este formulario, usted declara que los productos que desea publicar son reales,
                legales y están bajo su responsabilidad. El incumplimiento de estas condiciones puede
                conllevar la suspensión de su cuenta y la toma de acciones legales por parte de nuestra empresa.
              </p>
            </div>

            <label htmlFor="consentimiento">
              <input
                type="checkbox"
                id="consentimiento"
                checked={vendedorFormData.consentimiento}
                onChange={(e) => setVendedorFormData({ ...vendedorFormData, consentimiento: e.target.checked })}
                required
              />
              Acepto los términos y condiciones para convertirme en vendedor, y autorizo el uso de mis datos para fines de verificación.
            </label>

            <button type="submit" className="sell-form-submit">Enviar solicitud</button>
          </form>
        </div>

        ) : (
          <>
            {categoria === 'terrenos' && (
              
              <div className={`filters ${sidebarActive ? 'active' : ''}`}>

                <div className="filter-item">
                  <select
                    value={filters.estado}
                    onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                    className="filter-select"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="disponible">Disponible</option>
                    <option value="vendido">Vendido</option>
                  </select>
                </div>
                <div className="filter-item">
                  <input
                    type="text"
                    placeholder="Ubicación"
                    value={filters.ubicacion}
                    onChange={(e) => setFilters({ ...filters, ubicacion: e.target.value })}
                    className="filter-input"
                  />
                </div>

                <div className="filter-item">
                  <input
                    type="number"
                    placeholder="Precio mínimo"
                    value={filters.precioMin}
                    onChange={(e) => setFilters({ ...filters, precioMin: Math.max(0, e.target.value) })}
                    className="filter-input"
                  />
                </div>

                <div className="filter-item">
                  <input
                    type="number"
                    placeholder="Precio máximo"
                    value={filters.precioMax}
                    onChange={(e) => setFilters({ ...filters, precioMax: Math.max(filters.precioMin, e.target.value) })}
                    className="filter-input"
                  />
                </div>

                <div className="filter-item">
                  <select
                    value={filters.moneda}
                    onChange={(e) => setFilters({ ...filters, moneda: e.target.value })}
                    className="filter-select"
                  >
                    <option value="soles">Soles</option>
                    <option value="dolares">Dólares</option>
                  </select>
                </div>
              </div>
            )}

            <div className="gallery">
              {loading ? (
                <p>Cargando datos...</p>
              ) : categoria === 'terrenos' ? (
                sortedTerrenos.map((terreno, index) => {
                  //const imagenUrl = terreno.imagenes && Array.isArray(terreno.imagenes) ? `/terrenos/${terreno.imagenes[0]}` : '/default-image.jpg';
                  const vendedorNombre = getUsuarioDetails(terreno.usuario_id);
                  
                  return (
                    <div key={index} className="card">
                      <div className="card-image-container">
                      <ImageCarousel terreno={terreno} apiUrl={apiUrl} />
                        <h3 className="card-title">{terreno.titulo}</h3>
                      </div>
                      <div
                        key={index}
                        className="card-details"
                        ref={el => detailRefs.current[index] = el}
                      >


                      {/* Corazón */}

                        <i
                          className={`fas fa-heart heart-icon ${liked[index] ? 'liked' : ''}`}
                          onClick={(e) => {
                            const willLike = !liked[index];
                            toggleLike(index);
                            if (willLike) burstHearts(index, e);
                          }}
                        />            



                      <p className="card-price">
                          {filters.moneda === 'soles' ? `S/ ${terreno.precio}` : `$ ${terreno.precio}`}
                      </p>

                      {/* Ojito */}

                      <i className="fas fa-eye view-icon"/>

                      <i
                        className="fas fa-share-alt share-icon"
                        onClick={() => handleShare(index)} 
                      />

                            {/* Mostrar el menú de compartir cuando showShareMenu sea true */}
                            {activeShareIndex === index &&(
                              <div className="share-menu" ref={shareMenuRef}> {/* <-- aquí va el ref */}
                                <FacebookShareButton url={url} quote={text}>
                                  <FacebookIcon size={28} round />
                                </FacebookShareButton>
                                <TwitterShareButton url={url} title={text}>
                                  <TwitterIcon size={28} round />
                                </TwitterShareButton>
                                <WhatsappShareButton url={url} title={text}>
                                  <WhatsappIcon size={28} round />
                                </WhatsappShareButton>
                              </div>
                            )}



                        <p className="card-location">
                          <i className="fas fa-location-pin"></i> Lat: {terreno.ubicacion_lat}, Lon: {terreno.ubicacion_lon}
                        </p>
                        <p className="card-estado"><strong>Estado:</strong> {terreno.estado}</p>
                        <p className="card-vendedor"><strong>Vendedor:</strong> {vendedorNombre}</p>
                        <Link to={`/dashboard/terrenos/${terreno.id}`} target="_blank" rel="noopener noreferrer" className="card-button">Ver más</Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No hay datos disponibles para esta categoría.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>

  );
  


  return usuarioLocal && usuarioLocal.tipo
  ? usuarioLocal.tipo === 'admin'
    ? renderAdminView()
    : usuarioLocal.tipo === 'vendedor'
    ? renderVendedorView()
    : renderCompradorView()
  : null; // o puedes mostrar un <Loader />

};

export default DashboardMain;
