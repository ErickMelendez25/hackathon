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

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'terrenos/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use('/terrenos', express.static(terrenosDirectory)); // Servir archivos estáticos desde 'uploads'

console.log("HOST:", process.env.DB_HOST);
console.log("PORT:", process.env.DB_PORT);
console.log("USER:", process.env.DB_USER);
console.log("NAME:", process.env.DB_NAME);

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

  if (!google_id || !correo) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, result) => {
    if (err) {
      console.error('Error al consultar el usuario:', err);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    let usuario;
    if (result.length === 0) {
      db.query(
        'INSERT INTO usuarios (google_id, nombre, correo, imagen_perfil, tipo, puede_vender) VALUES (?, ?, ?, ?, ?, ?)',
        [google_id, nombre, correo, imagen_perfil, 'comprador', false],
        (err, insertResult) => {
          if (err) {
            console.error('Error al insertar el nuevo usuario:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
          }

          db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, newUserResult) => {
            if (err) {
              console.error('Error al consultar el nuevo usuario:', err);
              return res.status(500).json({ message: 'Error en el servidor' });
            }

            usuario = newUserResult[0];
            const token = jwt.sign({ id: usuario.id, correo: usuario.correo }, process.env.JWT_SECRET, { expiresIn: '7d' });

            res.status(200).json({ token, usuario });
          });
        }
      );
    } else {
      usuario = result[0];
      const token = jwt.sign({ id: usuario.id, correo: usuario.correo }, process.env.JWT_SECRET, { expiresIn: '7d' });

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

app.post('/Createterrenos',
  upload.fields([
    { name: 'imagenes', maxCount: 1 },
    { name: 'imagen_2', maxCount: 1 },
    { name: 'imagen_3', maxCount: 1 },
    { name: 'imagen_4', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        titulo, descripcion, precio,
        ubicacion_lat, ubicacion_lon,
        metros_cuadrados, estado, usuario_id
      } = req.body;

      const files = req.files;

      const imagen = files?.imagenes?.[0]?.filename || null;
      const imagen2 = files?.imagen_2?.[0]?.filename || null;
      const imagen3 = files?.imagen_3?.[0]?.filename || null;
      const imagen4 = files?.imagen_4?.[0]?.filename || null;
      const video = files?.video?.[0]?.filename || null;

      if (!titulo || !descripcion || !precio || !ubicacion_lat || !ubicacion_lon || !metros_cuadrados || !estado || !usuario_id) {
        console.error('Faltan campos en el formulario:', req.body);
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
      }

      console.log('Datos recibidos:', req.body);
      console.log('Archivos recibidos:', files);

      const query = `
        INSERT INTO terrenos
        (titulo, descripcion, precio, ubicacion_lat, ubicacion_lon, metros_cuadrados, imagenes, imagen_2, imagen_3, imagen_4, video, estado, usuario_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(query, [
        titulo, descripcion, precio,
        ubicacion_lat, ubicacion_lon,
        metros_cuadrados, imagen, imagen2, imagen3, imagen4, video,
        estado, usuario_id
      ], (err, result) => {
        if (err) {
          console.error('Error al crear el terreno:', err);
          return res.status(500).json({ message: 'Error en el servidor', error: err.message });
        }

        res.status(201).json({
          message: 'Terreno creado exitosamente',
          terrenoId: result.insertId,
        });
      });

    } catch (error) {
      console.error('Error al crear el terreno:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

app.put('/UpdateTerreno/:id',
  upload.fields([
    { name: 'imagenes', maxCount: 1 },
    { name: 'imagen_2', maxCount: 1 },
    { name: 'imagen_3', maxCount: 1 },
    { name: 'imagen_4', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;  // Obtener el ID del terreno desde la URL
      const {
        titulo, descripcion, precio,
        ubicacion_lat, ubicacion_lon,
        metros_cuadrados, estado, usuario_id
      } = req.body;

      const files = req.files;

      // Verificar si hay archivos y asignarlos
      const imagen = files?.imagenes?.[0]?.filename || null;
      const imagen2 = files?.imagen_2?.[0]?.filename || null;
      const imagen3 = files?.imagen_3?.[0]?.filename || null;
      const imagen4 = files?.imagen_4?.[0]?.filename || null;
      const video = files?.video?.[0]?.filename || null;

      if (!titulo || !descripcion || !precio || !ubicacion_lat || !ubicacion_lon || !metros_cuadrados || !estado || !usuario_id) {
        console.error('Faltan campos en el formulario:', req.body);
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
      }

      console.log('Datos recibidos:', req.body);
      console.log('Archivos recibidos:', files);

      // Consulta SQL para actualizar el terreno
      const query = `
        UPDATE terrenos
        SET 
          titulo = ?, descripcion = ?, precio = ?, 
          ubicacion_lat = ?, ubicacion_lon = ?, 
          metros_cuadrados = ?, imagenes = ?, imagen_2 = ?, 
          imagen_3 = ?, imagen_4 = ?, video = ?, 
          estado = ?, usuario_id = ?
        WHERE id = ?`;

      db.query(query, [
        titulo, descripcion, precio,
        ubicacion_lat, ubicacion_lon,
        metros_cuadrados, imagen, imagen2, imagen3, imagen4, video,
        estado, usuario_id, id  // ID del terreno para actualizar
      ], (err, result) => {
        if (err) {
          console.error('Error al actualizar el terreno:', err);
          return res.status(500).json({ message: 'Error en el servidor', error: err.message });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Terreno no encontrado' });
        }

        res.status(200).json({
          message: 'Terreno actualizado exitosamente',
          terrenoId: id,
        });
      });

    } catch (error) {
      console.error('Error al actualizar el terreno:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  });

  app.delete('/DeleteTerreno/:id', async (req, res) => {
    try {
      const { id } = req.params;  // Obtener el ID del terreno desde la URL
  
      // Consulta SQL para eliminar el terreno
      const query = `DELETE FROM terrenos WHERE id = ?`;
  
      db.query(query, [id], (err, result) => {
        if (err) {
          console.error('Error al eliminar el terreno:', err);
          return res.status(500).json({ message: 'Error en el servidor', error: err.message });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Terreno no encontrado' });
        }
  
        res.status(200).json({
          message: 'Terreno eliminado exitosamente',
          terrenoId: id,
        });
      });
  
    } catch (error) {
      console.error('Error al eliminar el terreno:', error);
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
