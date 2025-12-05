import axios from "axios";
import axiosClient from "./axiosClient";

const API_URL = import.meta.env.VITE_API_URL;

export const cursosApi = {
  listarPublicos: () => axios.get(`${API_URL}/cursos`),
  obtenerPorId: (id) => axios.get(`${API_URL}/cursos/${id}`),
  crear: (data) => axios.post(`${API_URL}/cursos`, data),

  obtenerCursos: () => axiosClient.get(`/cursos`),
  crearCurso: (data) => axiosClient.post(`/cursos`, data),
  obtenerSecciones: (cursoId) => axiosClient.get(`/cursos/${cursoId}/secciones`)
};
