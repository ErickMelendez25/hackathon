import api from "./api";

const getAll = async () => {
  const { data } = await api.get("/api/solicitudes");
  return Array.isArray(data) ? data : [];
};

const updateEstado = async (id, estado) => {
  await api.put("/api/verificarsolicitud", { solicitud_id: id, estado });
};

export default { getAll, updateEstado };
