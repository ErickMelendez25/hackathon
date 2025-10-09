import api from "./api";

const getAll = async () => {
  const { data } = await api.get("/api/terrenos");
  return Array.isArray(data) ? data : [];
};

const create = async (formData) => {
  await api.post("/Createterrenos", formData);
};

const update = async (id, formData) => {
  await api.put(`/UpdateTerreno/${id}`, formData);
};

const remove = async (id) => {
  await api.delete(`/DeleteTerreno/${id}`);
};

export default { getAll, create, update, remove };
