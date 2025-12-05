// src/components/pagos/MpRedirect.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function MpRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const preference_id =
      params.get("preference_id") ||
      params.get("preference-id") ||
      params.get("preferenceId");

    if (!preference_id) {
      navigate("/");
      return;
    }

    navigate(`/pago-exitoso?${params.toString()}`);
  }, []);

  return <div>Redirigiendo...</div>;
}
