const { initDB } = require("../config/db");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

// LOGIN REAL
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Faltan credenciales" });

    const db = await initDB();
    const [rows] = await db.query("SELECT * FROM usuarios WHERE correo = ?", [email]);
    if (rows.length === 0)
      return res.status(401).json({ message: "Credenciales inválidas" });

    const usuario = rows[0];

    // verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.contraseña_hash);
    if (!passwordValida)
      return res.status(401).json({ message: "Credenciales inválidas" });

    // generar JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Error en login" });
  }
};

// CREAR USUARIO DESPUÉS DE COMPRA (puede ser el mismo que ya hiciste)
exports.crearUsuarioPorCompra = async (req, res) => {
  // puedes reutilizar tu lógica de pagoYapeSimulado
  // luego devolver el token generado
  return res.json({ ok: true, userId: 999, token: "TOKEN_DEMO" });
};

// PERFIL REAL (requiere middleware JWT)
exports.perfil = async (req, res) => {
  try {
    const db = await initDB();
    const [rows] = await db.query("SELECT id, nombre, apellido_paterno, apellido_materno, correo, rol FROM usuarios WHERE id = ?", [req.user.id]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });
    return res.json(rows[0]);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Error obteniendo perfil" });
  }
};
