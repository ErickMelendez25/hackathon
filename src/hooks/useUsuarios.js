import { useState, useEffect } from "react";
import usuariosService from "../services/usuariosService";

export default function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    usuariosService.getAll().then(setUsuarios).catch(console.error);
  }, []);

  return { usuarios };
}
