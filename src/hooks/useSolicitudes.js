import { useState, useCallback } from "react";
import solicitudesService from "../services/solicitudesService";

export default function useSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await solicitudesService.getAll();
      setSolicitudes(data);
    } catch (err) {
      console.error("Error al cargar solicitudes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const aprobar = async (id) => {
    await solicitudesService.updateEstado(id, "aprobada");
    fetchSolicitudes();
  };

  const rechazar = async (id) => {
    await solicitudesService.updateEstado(id, "rechazada");
    fetchSolicitudes();
  };

  return { solicitudes, loading, fetchSolicitudes, aprobar, rechazar };
}
