const { initDB } = require("../config/db");
const bcrypt = require("bcryptjs");

exports.listarUsuarios = async (req, res) => {
  try {
    const db = await initDB();
    const [rows] = await db.query("SELECT id, nombre, apellido_paterno, apellido_materno, correo, rol, estado, numero_documento FROM usuarios");
    res.json(rows);
  } catch (e) {
    console.error(e); res.status(500).json({ error: "Error listando usuarios" });
  }
};

exports.obtenerUsuario = async (req, res) => {
  try {
    const db = await initDB();
    const [rows] = await db.query("SELECT id, nombre, apellido_paterno, apellido_materno, correo, rol, estado, numero_documento FROM usuarios WHERE id = ?", [req.params.id]);
    res.json(rows[0] || {});
  } catch (e) { console.error(e); res.status(500).json({ error: "Error obteniendo usuario" }); }
};

exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido_paterno, apellido_materno, correo, numero_documento, rol } = req.body;
    if (!correo || !nombre) return res.status(400).json({ error: "Datos incompletos" });
    const db = await initDB();
    const passTemp = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(passTemp, 10);
    const [ins] = await db.query(`INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, correo, contraseña_hash, numero_documento, rol) VALUES (?,?,?,?,?,?,?)`,
      [nombre, apellido_paterno, apellido_materno, correo, hash, numero_documento || null, rol || "ESTUDIANTE"]);
    res.json({ ok: true, id: ins.insertId });
  } catch (e) { console.error(e); res.status(500).json({ error: "Error creando usuario" }); }
};

exports.actualizarUsuario = async (req, res) => {
  try {
    const { nombre, apellido_paterno, apellido_materno, correo, rol, estado } = req.body;
    const db = await initDB();
    await db.query(`UPDATE usuarios SET nombre=?, apellido_paterno=?, apellido_materno=?, correo=?, rol=?, estado=? WHERE id=?`,
      [nombre, apellido_paterno, apellido_materno, correo, rol, estado, req.params.id]);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: "Error actualizando usuario" }); }
};

exports.eliminarUsuario = async (req, res) => {
  try {
    const db = await initDB();
    await db.query("DELETE FROM usuarios WHERE id = ?", [req.params.id]);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: "Error eliminando usuario" }); }
};
