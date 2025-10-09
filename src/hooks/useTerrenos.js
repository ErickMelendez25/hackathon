import { useState, useCallback } from "react";
import terrenosService from "../services/terrenosService";

export default function useTerrenos() {
  const [terrenos, setTerrenos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTerrenos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await terrenosService.getAll();
      setTerrenos(data);
    } catch (error) {
      console.error("Error al cargar terrenos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTerreno = async (formData) => {
    await terrenosService.create(formData);
    fetchTerrenos();
  };

  const updateTerreno = async (id, formData) => {
    await terrenosService.update(id, formData);
    fetchTerrenos();
  };

  const deleteTerreno = async (id) => {
    await terrenosService.remove(id);
    fetchTerrenos();
  };

  return { terrenos, loading, fetchTerrenos, createTerreno, updateTerreno, deleteTerreno };
}
