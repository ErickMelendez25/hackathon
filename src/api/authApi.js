// src/api/authApi.js
import axiosClient from "./axiosClient";

export const authApi = {
  login: (data) => axiosClient.post("/auth/login", data),
  logout: () => axiosClient.post("/auth/logout"),
  perfil: () => axiosClient.get("/auth/me"),
  registerAfterPayment: (data) => axiosClient.post("/auth/register-after-payment", data)
};
