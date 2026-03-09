const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto123_demo';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let db;

// ==========================
// INICIALIZACIÓN DE SQLITE
// ==========================
(async () => {
    try {
        db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        await db.run('PRAGMA foreign_keys = ON;');

        await db.exec(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                rol TEXT DEFAULT 'user'
            );
            CREATE TABLE IF NOT EXISTS tareas (
                id TEXT PRIMARY KEY,
                titulo TEXT NOT NULL,
                estado TEXT NOT NULL DEFAULT 'pendiente',
                descripcion TEXT,
                horas REAL,
                ubicacion TEXT,
                usuario_id TEXT NOT NULL,
                FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            );
        `);

        // Insertar usuarios demo si no existen
        const adminUser = await db.get('SELECT id FROM usuarios WHERE username = ?', 'admin');
        if (!adminUser) {
            const salt = await bcrypt.genSalt(10);
            const pAdmin = await bcrypt.hash('admin123', salt);
            const pDemo = await bcrypt.hash('demo123', salt);
            const pTest = await bcrypt.hash('test123', salt);

            await db.run('INSERT OR IGNORE INTO usuarios (id, username, password_hash, rol) VALUES (?, ?, ?, ?)', ['demo_admin', 'admin', pAdmin, 'admin']);
            await db.run('INSERT OR IGNORE INTO usuarios (id, username, password_hash, rol) VALUES (?, ?, ?, ?)', ['demo_user1', 'demo', pDemo, 'user']);
            await db.run('INSERT OR IGNORE INTO usuarios (id, username, password_hash, rol) VALUES (?, ?, ?, ?)', ['demo_test', 'test', pTest, 'user']);
            console.log('Usuarios demo generados y listos para pruebas en SQLite:');
            console.log('- admin / admin123');
            console.log('- demo / demo123');
            console.log('- test / test123');
        } else {
            console.log('Base de datos SQLite lista. Usuarios demo ya existen.');
        }
    } catch (error) {
        console.error('Error inicializando SQLite:', error);
    }
})();

// ==========================
// MIDDLEWARES
// ==========================
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Token de acceso requerido.' });

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
}

async function verifyAdmin(req, res, next) {
    try {
        const user = await db.get('SELECT rol FROM usuarios WHERE id = ?', req.userId);
        if (!user || user.rol !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de administrador.' });
        }
        next();
    } catch (err) {
        return res.status(500).json({ error: 'Error verificando privilegios de administrador.' });
    }
}

// ==========================
// RUTAS DE AUTENTICACION Y USUARIOS
// ==========================

app.get('/usuarios', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const users = await db.all('SELECT id, username, rol FROM usuarios');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuarios.' });
    }
});

app.post('/registro', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ error: 'Faltan datos de username o password.' });
        }

        const sanitizedUser = username.trim();

        const existingUser = await db.get('SELECT id FROM usuarios WHERE LOWER(username) = LOWER(?)', sanitizedUser);
        if (existingUser) {
            return res.status(400).json({ error: 'Ya existe un usuario con ese username.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const newId = 'user_' + Date.now().toString() + Math.random().toString(36).substring(2, 5);

        await db.run('INSERT INTO usuarios (id, username, password_hash) VALUES (?, ?, ?)', [newId, sanitizedUser, password_hash]);

        res.status(201).json({ id: newId, username: sanitizedUser });
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar usuario.' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const sanitizedUser = (username || '').trim();

        const user = await db.get('SELECT id, username, password_hash, rol FROM usuarios WHERE LOWER(username) = LOWER(?)', sanitizedUser);
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '8h' });
        res.status(200).json({ token, id: user.id, username: user.username, rol: user.rol });
    } catch (err) {
        res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
});

app.delete('/usuarios/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const userId = req.params.id;

        if (userId === req.userId) {
            return res.status(403).json({ error: 'Operación denegada: no puedes purgar tu propia cuenta de administrador.' });
        }

        const user = await db.get('SELECT id FROM usuarios WHERE id = ?', userId);

        if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

        await db.run('DELETE FROM usuarios WHERE id = ?', userId);

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar usuario.' });
    }
});

// ==========================
// RUTAS DE TAREAS Y DASHBOARD (PRIVADAS)
// ==========================

app.get('/dashboard', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const totalObj = await db.get('SELECT COUNT(*) as count FROM tareas');
        const completedObj = await db.get('SELECT COUNT(*) as count FROM tareas WHERE estado = ?', 'completada');

        const total = totalObj.count;
        const completed = completedObj.count;
        const pending = total - completed;
        const success_rate = total === 0 ? '0%' : Math.round((completed / total) * 100) + '%';

        res.status(200).json({
            tareas_completadas: completed,
            tareas_pendientes: pending,
            tasa_exito: success_rate
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener estadísticas del dashboard global.' });
    }
});

app.get('/dashboard/personal', verifyToken, async (req, res) => {
    try {
        const totalObj = await db.get('SELECT COUNT(*) as count FROM tareas WHERE usuario_id = ?', req.userId);
        const completedObj = await db.get('SELECT COUNT(*) as count FROM tareas WHERE estado = ? AND usuario_id = ?', ['completada', req.userId]);

        const total = totalObj.count;
        const completed = completedObj.count;
        const pending = total - completed;
        const success_rate = total === 0 ? '0%' : Math.round((completed / total) * 100) + '%';

        res.status(200).json({
            tareas_completadas: completed,
            tareas_pendientes: pending,
            tasa_exito: success_rate
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener estadísticas personales.' });
    }
});

app.get('/usuarios/:id/tareas', verifyToken, async (req, res) => {
    try {
        const targetUserId = req.params.id;
        if (req.userId !== targetUserId) {
            const user = await db.get('SELECT rol FROM usuarios WHERE id = ?', req.userId);
            if (!user || user.rol !== 'admin') {
                return res.status(403).json({ error: 'Acceso denegado. No tienes autorización para ver las tareas de este usuario.' });
            }
        }

        const tasks = await db.all('SELECT * FROM tareas WHERE usuario_id = ?', targetUserId);
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener tareas del usuario.' });
    }
});

app.get('/tareas', verifyToken, async (req, res) => {
    try {
        const userTasks = await db.all('SELECT * FROM tareas WHERE usuario_id = ?', req.userId);
        res.status(200).json(userTasks);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener tareas.' });
    }
});

app.post('/tareas', verifyToken, async (req, res) => {
    try {
        const { titulo, estado, descripcion, horas, ubicacion, usuario_id } = req.body;

        const uId = usuario_id || req.userId;

        if (uId !== req.userId) {
            const userAdminCheck = await db.get('SELECT rol FROM usuarios WHERE id = ?', req.userId);
            if (!userAdminCheck || userAdminCheck.rol !== 'admin') {
                return res.status(403).json({ error: 'Acceso denegado. Solo los administradores pueden asignar tareas a otros usuarios.' });
            }
        }

        if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
            return res.status(400).json({ error: 'El campo "titulo" es obligatorio.' });
        }

        const sanitizedTitulo = titulo.trim();
        const existingTask = await db.get('SELECT id FROM tareas WHERE LOWER(titulo) = LOWER(?) AND usuario_id = ?', sanitizedTitulo, uId);

        if (existingTask) {
            return res.status(409).json({ error: 'Ya tienes una tarea con ese título.' });
        }

        const estadosValidos = ['pendiente', 'en_progreso', 'completada'];
        if (estado && !estadosValidos.includes(estado)) {
            return res.status(400).json({ error: 'Estado inválido.' });
        }

        const newId = 'task_' + Date.now().toString() + Math.random().toString(36).substring(2, 5);
        const finalEstado = estado || 'pendiente';
        const finalHoras = (horas !== undefined && horas !== null && horas !== '') ? Number(horas) : null;

        await db.run(
            'INSERT INTO tareas (id, titulo, estado, descripcion, horas, ubicacion, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [newId, sanitizedTitulo, finalEstado, descripcion || null, finalHoras, ubicacion || null, uId]
        );

        const createdTask = await db.get('SELECT * FROM tareas WHERE id = ?', newId);
        res.status(201).json(createdTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear la tarea.' });
    }
});

app.get('/tareas/:id', verifyToken, async (req, res) => {
    try {
        const task = await db.get('SELECT * FROM tareas WHERE id = ? AND usuario_id = ?', [req.params.id, req.userId]);
        if (!task) return res.status(404).json({ error: 'Tarea no encontrada o no tienes acceso.' });
        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener la tarea.' });
    }
});

app.put('/tareas/:id', verifyToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await db.get('SELECT * FROM tareas WHERE id = ? AND usuario_id = ?', [taskId, req.userId]);

        if (!task) return res.status(404).json({ error: 'Tarea no encontrada o no tienes acceso.' });

        const { titulo, estado, descripcion, horas, ubicacion } = req.body;

        let newTitulo = task.titulo;
        let newEstado = task.estado;
        let newDescripcion = task.descripcion;
        let newHoras = task.horas;
        let newUbicacion = task.ubicacion;

        if (titulo !== undefined) {
            if (typeof titulo !== 'string' || titulo.trim() === '') {
                return res.status(400).json({ error: 'El título no puede estar vacío.' });
            }
            newTitulo = titulo.trim();
            const duplicate = await db.get('SELECT id FROM tareas WHERE id != ? AND usuario_id = ? AND LOWER(titulo) = LOWER(?)', [taskId, req.userId, newTitulo]);
            if (duplicate) return res.status(409).json({ error: 'Ya tienes otra tarea con ese título.' });
        }

        if (estado !== undefined) {
            const estadosValidos = ['pendiente', 'en_progreso', 'completada'];
            if (!estadosValidos.includes(estado)) return res.status(400).json({ error: 'Estado inválido.' });
            newEstado = estado;
        }

        if (descripcion !== undefined) newDescripcion = descripcion;
        if (horas !== undefined) {
            if (horas === '' || horas === null) newHoras = null;
            else if (isNaN(Number(horas))) return res.status(400).json({ error: 'Horas inválidas.' });
            else newHoras = Number(horas);
        }
        if (ubicacion !== undefined) newUbicacion = ubicacion;

        await db.run(
            'UPDATE tareas SET titulo = ?, estado = ?, descripcion = ?, horas = ?, ubicacion = ? WHERE id = ?',
            [newTitulo, newEstado, newDescripcion, newHoras, newUbicacion, taskId]
        );

        const updatedTask = await db.get('SELECT * FROM tareas WHERE id = ?', taskId);
        res.status(200).json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar la tarea.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de Task Management API ejecutándose en http://localhost:${PORT}`);
});
