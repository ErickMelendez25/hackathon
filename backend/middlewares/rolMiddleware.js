// middleware para validar roles

function rolMiddleware(...rolesPermitidos) {
  return (req, res, next) => {
    try {
      const rolUsuario = req.user?.rol;

      if (!rolUsuario) {
        return res.status(401).json({ message: "No autorizado: usuario sin rol" });
      }

      if (!rolesPermitidos.includes(rolUsuario)) {
        return res.status(403).json({ message: "Acceso denegado: rol insuficiente" });
      }

      next();
    } catch (err) {
      console.error("Error en rolMiddleware:", err);
      return res.status(500).json({ message: "Error interno en middleware de roles" });
    }
  };
}

module.exports = { rolMiddleware };
