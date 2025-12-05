import axiosClient from "./axiosClient"; // tu cliente configurado de axios

// =========================
// MERCADO PAGO
// =========================
export const iniciarPagoMercadoPago = (seccion_id, alumno, curso) =>
  axiosClient.post("/pagos/mercadopago", {
    alumno,
    curso: { ...curso, seccion_id },
  });

// =========================
// YAPE SIMULADO
// =========================
export const pagarConYapeSimulado = (payload) =>
  axiosClient.post("/pagos/yape-simulado", payload);
