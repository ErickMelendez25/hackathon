// src/api/seccionesApi.js
import axiosClient from "./axiosClient";

export const obtenerSeccionesPorCurso = (cursoId) =>
  axiosClient.get(`/secciones/curso/${cursoId}`);
