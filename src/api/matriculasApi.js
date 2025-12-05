// src/api/matriculasApi.js
import axiosClient from "./axiosClient";

const matriculasApi = {
  misMatriculas: (userId) => axiosClient.get(`/matriculas/usuario/${userId}`),
};

export const registrarMatricula = (data) =>
  axiosClient.post("/matriculas/registrar-desde-pago", data);

export default matriculasApi;
