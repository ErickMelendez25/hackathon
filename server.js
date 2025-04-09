import nodemailer from 'nodemailer';
import express from 'express';
import mysql from 'mysql2';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config(); // Carga las variables de entorno desde el archivo .env

const app = express();
const port = process.env.PORT || 8080;

const __dirname = path.resolve();  // Obtener la ruta del directorio actual (correcto para Windows)

// Configura CORS para permitir solicitudes solo desde tu frontend
const corsOptions = {
  origin: ['https://sateliterrreno-production.up.railway.app', 'http://localhost:5173', 'http://localhost:5000'],
  methods: 'GET, POST, PUT, DELETE',
  allowedHeaders: 'Content-Type, Authorization',
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

// Verificar si la carpeta 'uploads' existe, si no, crearla
const terrenosDirectory  = path.join(__dirname, 'terrenos');
if (!fs.existsSync(terrenosDirectory)) {
  fs.mkdirSync(terrenosDirectory, { recursive: true });
}

// Configuración de almacenamiento de archivos con multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, terrenosDirectory),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),  // Usar fecha para nombres únicos
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },  // Limitar tamaño a 10MB por archivo
});

app.use('/terrenos', express.static(terrenosDirectory)); // Servir archivos estáticos desde 'uploads'

// Configuración de la base de datos
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

// Verificar la conexión a la base de datos
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.stack);
    return;
  }
  console.log('Conexión a la base de datos exitosa');
  connection.release();
});

// Función para generar el token
const generateToken = (user) => {
  const payload = { correo: user.correo, rol: user.rol };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });  // Usar la variable de entorno para la clave secreta
};

// Middleware para verificar el token de autenticación
const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];  // Obtenemos el token del header

  if (!token) {
    return res.status(403).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido' });
    }
    req.user = decoded;  // Agregamos los datos del usuario decodificados
    next();
  });
};

// Endpoint de autenticación con Google
app.post('/auth', (req, res) => {
  const { google_id, nombre, correo, imagen_perfil } = req.body;
  console.log('Datos recibidos en /auth:', { google_id, nombre, correo, imagen_perfil });

  if (!google_id || !correo) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  // Verifica si el usuario ya existe en la base de datos
  db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, result) => {
    if (err) {
      console.error('Error al consultar el usuario:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    let usuario;
    if (result.length === 0) {
      // Si no existe, insertamos un nuevo usuario con un password predeterminado
      const defaultPassword = 'vklmeñjvneio4uh9pg8uhve'; // La contraseña por defecto
      db.query(
        'INSERT INTO usuarios (google_id, nombre, correo, imagen_perfil, tipo, puede_vender, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [google_id, nombre, correo, imagen_perfil, 'comprador', false, defaultPassword],
        (err, insertResult) => {
          if (err) {
            console.error('Error al insertar el nuevo usuario:', err);
            return res.status(500).json({ message: 'Error al insertar el nuevo usuario' });
          }

          // Recuperamos los datos del usuario insertado
          const [newUser] = insertResult;

          usuario = newUser;

          // Generamos el token de autenticación
          const token = jwt.sign({ id: usuario.id, correo: usuario.correo }, process.env.JWT_SECRET, { expiresIn: '7d' });

          // Responder con el token y los datos del usuario
          res.status(200).json({ token, usuario });
        }
      );
    } else {
      // Si el usuario existe, recuperamos los datos
      usuario = result[0];

      // Generamos el token de autenticación
      const token = jwt.sign({ id: usuario.id, correo: usuario.correo }, process.env.JWT_SECRET, { expiresIn: '7d' });

      // Responder con el token y los datos del usuario
      res.status(200).json({ token, usuario });
    }
  });
});



// Ruta de login
app.post('/login', (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
  }

  db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, result) => {
    if (err) {
      console.error('Error al consultar el usuario:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = result[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error al comparar las contraseñas:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
      }

      if (!isMatch) {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
      }

      // Inicializamos las variables de ID
      let id_estudiante = null;
      let id_asesor = null;
      let id_revisor = null;
     
      // Manejo según rol
      if (user.rol === 'revisor') {
        db.query('SELECT id FROM revisores WHERE correo = ?', [user.correo], (err, revisorResult) => {
          if (err) {
            console.error('Error al consultar el revisor:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
          }

          id_revisor = revisorResult.length > 0 ? revisorResult[0].id : null;

          const token = generateToken(user);
          res.status(200).json({
            message: 'Login exitoso',
            token,
            usuario: { correo: user.correo, rol: user.rol, id_estudiante: null, id_asesor: null, id_revisor },
          });
        });
      } else if (user.rol === 'asesor') {
        db.query('SELECT id FROM asesores WHERE correo = ?', [user.correo], (err, asesorResult) => {
          if (err) {
            console.error('Error al consultar el asesor:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
          }

          id_asesor = asesorResult.length > 0 ? asesorResult[0].id : null;

          db.query('SELECT id FROM estudiantes WHERE correo = ?', [user.correo], (err, studentResult) => {
            if (err) {
              console.error('Error al consultar el estudiante:', err);
              return res.status(500).json({ message: 'Error en el servidor' });
            }

            id_estudiante = studentResult.length > 0 ? studentResult[0].id : null;

            const token = generateToken(user);
            res.status(200).json({
              message: 'Login exitoso',
              token,
              usuario: { correo: user.correo, rol: user.rol, id_estudiante, id_asesor, id_revisor: null },
            });
          });
        });
      } else {
        db.query('SELECT id FROM usuarios WHERE correo = ?', [user.correo], (err, studentResult) => {
          if (err) {
            console.error('Error al consultar el usuario:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
          }

          id_estudiante = studentResult.length > 0 ? studentResult[0].id : null;

          const token = generateToken(user);
          res.status(200).json({
            message: 'Login exitoso',
            token,
            usuario: { correo: user.correo, rol: user.rol, id_estudiante, id_asesor: null, id_revisor: null },
          });
        });
      }
    });
  });
});

// Rutas de usuarios y terrenos con autorización
app.get('/api/usuarios', async (req, res) => {
  try {
    // Usamos db.query en lugar de connection.execute
    db.query('SELECT * FROM usuarios', (err, rows) => {
      if (err) {
        // Manejo de errores si la consulta falla
        console.error('Error al obtener usuarios:', err);
        return res.status(500).json({ message: 'Error al obtener usuarios', error: err.message });
      }
      
      // Si no hay errores, devolvemos los usuarios obtenidos
      res.json(rows);
    });
  } catch (error) {
    // Si ocurre un error inesperado
    console.error('Error inesperado al obtener usuarios:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});


app.get('/api/terrenos', async (req, res) => {
  try {
    // Ejecutamos la consulta con db.query
    db.query('SELECT * FROM terrenos', (err, rows) => {
      if (err) {
        // Manejo de errores si algo sale mal
        console.error('Error al consultar los terrenos:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
      }

      // Enviamos los resultados de la consulta como respuesta
      res.json(rows);
    });
  } catch (error) {
    // Si hay algún error inesperado
    console.error('Error al obtener terrenos:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta para obtener los detalles de un terreno por ID
app.get('/api/terrenos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Usamos db.query en lugar de connection.execute
    db.query('SELECT * FROM terrenos WHERE id = ?', [id], (err, rows) => {
      if (err) {
        // Manejo de errores si la consulta falla
        console.error('Error al obtener el terreno:', err);
        return res.status(500).json({ message: 'Error en el servidor', error: err.message });
      }

      // Si no se encuentra el terreno, devolvemos 404
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Terreno no encontrado' });
      }

      // Devolvemos el primer terreno encontrado
      res.json(rows[0]);
    });
  } catch (error) {
    // Si ocurre algún error inesperado
    console.error('Error inesperado al obtener el terreno:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});


// Ruta para obtener un usuario por ID
app.get('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Usamos db.query en lugar de connection.execute
    db.query('SELECT * FROM usuarios WHERE id = ?', [id], (err, rows) => {
      if (err) {
        // Manejo de errores si la consulta falla
        console.error('Error al obtener el usuario:', err);
        return res.status(500).json({ message: 'Error en el servidor', error: err.message });
      }

      // Si no se encuentra el usuario, devolvemos 404
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Devolvemos el primer usuario encontrado
      res.json(rows[0]);
    });
  } catch (error) {
    // Si ocurre algún error inesperado
    console.error('Error inesperado al obtener el usuario:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});



// Para cualquier otra ruta, servir el index.html
app.use(express.static(path.join(__dirname, 'dist')));

// Ruta principal
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
