import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function PagoExitoso() {
  const [loading, setLoading] = useState(true);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const procesar = async () => {
      try {
        const collection_id =
          params.get("collection_id") || params.get("collection-id") || null;

        const res = await axiosClient.post("/pagos/exito", {
          collection_id,
        });

        if (res.data.redirect) {
          navigate(res.data.redirect);
          return;
        }

        setLoading(false);

      } catch (e) {
        navigate("/error");
      }
    };

    procesar();
  }, []);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      {loading ? "Procesando pago..." : "Pago completado 🎉"}
    </div>
  );
}
