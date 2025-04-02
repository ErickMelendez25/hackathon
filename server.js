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
  origin: ['https://sateliterreno-production.up.railway.app', 'http://localhost:5000'],
  methods: 'GET, POST, PUT, DELETE',
  allowedHeaders: 'Content-Type, Authorization',
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

// Verificar si la carpeta 'uploads' existe, si no, crearla
const uploadDirectory = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Configuración de almacenamiento de archivos con multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirectory),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),  // Usar fecha para nombres únicos
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },  // Limitar tamaño a 10MB por archivo
});

app.use('/uploads', express.static(uploadDirectory)); // Servir archivos estáticos desde 'uploads'

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
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.execute('SELECT * FROM usuarios');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/terrenos', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();

    const [rows] = await connection.execute('SELECT * FROM terrenos  ');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener terrenos:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  } finally {
    if (connection) connection.release();
  }
});

// Ruta para obtener los detalles de un terreno por ID
app.get('/api/terrenos/:id', async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.execute('SELECT * FROM terrenos WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Terreno no encontrado' });
    }

    res.json(rows[0]); // Devuelve el terreno específico
  } catch (error) {
    console.error('Error al obtener el terreno:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  } finally {
    if (connection) connection.release();
  }
});

// Ruta para obtener un usuario por ID
app.get('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await db.getConnection();

    const [rows] = await connection.execute('SELECT * FROM usuarios WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(rows[0]); // Devuelve el usuario específico
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  } finally {
    if (connection) connection.release();
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
