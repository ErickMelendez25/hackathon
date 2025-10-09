import api from "./api";

const getAll = async () => {
  const { data } = await api.get("/api/usuarios");
  return Array.isArray(data) ? data : [];
};

export default { getAll };
