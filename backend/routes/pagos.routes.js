const express = require("express");
const router = express.Router();
require("dotenv").config();

const { registrarPagoExitoso, pagoYapeSimulado } = require("../controllers/pagos.controller");
const { initDB } = require("../config/db");

const { MercadoPagoConfig, Preference } = require("mercadopago");

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const preferenceClient = new Preference(mp);

// FRONTEND URL
const FRONT_URL = process.env.FRONT_URL.trim().replace(/\/$/, "");
const IS_DEV = FRONT_URL.includes("localhost");

// =================================================
// 1️⃣ MERCADO PAGO (NO SE TOCA)
// =================================================
router.post("/mercadopago", async (req, res) => {
  try {
    const { alumno, curso } = req.body;

    if (!alumno || !curso) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const preference = {
      items: [
        {
          title: curso.titulo,
          quantity: 1,
          unit_price: Number(curso.precio),
          currency_id: "PEN",
        },
      ],

      back_urls: {
        success: `${FRONT_URL}/mp-redirect`,
        failure: `${FRONT_URL}/mp-redirect`,
        pending: `${FRONT_URL}/mp-redirect`,
      },

      ...(IS_DEV ? {} : { auto_return: "approved" }),
      binary_mode: false,
    };

    const response = await preferenceClient.create({ body: preference });

    const db = await initDB();

    await db.query(
      `INSERT INTO preferencias
      (preference_id, correo, nombre, apellido_paterno, apellido_materno,
       numero_documento, telefono, seccion_id)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        response.id,
        alumno.correo,
        alumno.nombre,
        alumno.apellido_paterno,
        alumno.apellido_materno,
        alumno.numero_documento,
        alumno.telefono,
        curso.seccion_id,
      ]
    );

    return res.json({ init_point: response.init_point });
  } catch (err) {
    console.error("💥 ERROR MP:", err);
    return res.status(500).json({ error: "Error Mercado Pago", detalle: err.message });
  }
});

// =================================================
// 2️⃣ YAPE SIMULADO
// =================================================
router.post("/yape-simulado", pagoYapeSimulado);

// =================================================
// 3️⃣ REGISTRO DE PAGO (WEBHOOK + WEB)
// =================================================
//router.post("/exito", registrarPagoExitoso);

module.exports = router;
