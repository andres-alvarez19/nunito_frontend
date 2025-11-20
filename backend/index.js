const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// In-memory data stores
const teachers = [];
const rooms = [];
const gameResults = [];

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/api/rooms', (req, res) => {
  const { name, game, difficulty, duration, teacher } = req.body;
  const newRoom = {
    id: new Date().toISOString(),
    code: generateRoomCode(),
    name,
    game,
    difficulty,
    duration,
    teacher,
    students: [],
    isActive: true,
  };
  rooms.push(newRoom);
  res.status(201).json(newRoom);
});
app.post('/api/rooms/:roomCode/results', (req, res) => {
  const { roomCode } = req.params;
  const { studentName, results } = req.body;

  const room = rooms.find(r => r.code === roomCode);
  if (room) {
    const result = {
      roomCode,
      studentName,
      results,
      timestamp: new Date().toISOString(),
    };
    gameResults.push(result);
    broadcastToRoom(roomCode, { type: 'results-submitted', payload: { studentName, results } });
    res.status(201).json(result);
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
});

app.get('/api/rooms/:roomCode/results', (req, res) => {

  const { roomCode } = req.params;

  const results = gameResults.filter(r => r.roomCode === roomCode);

  res.json(results);

});



app.get('/api/rooms/all/results', (req, res) => {

  res.json(gameResults);

});



app.post('/api/teachers/register', (req, res) => {

  const { name, email, password } = req.body;

  if (teachers.find(t => t.email === email)) {

    return res.status(400).json({ message: 'Teacher already exists' });

  }

  const newTeacher = { name, email, password };

  teachers.push(newTeacher);

  res.status(201).json(newTeacher);

});

app.post('/api/teachers/login', (req, res) => {
  const { email, password } = req.body;
  const teacher = teachers.find(t => t.email === email && t.password === password);
  if (teacher) {
    res.json(teacher);
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store clients per room
const roomClients = new Map();

wss.on('connection', (ws, req) => {
  const roomCode = new URL(req.url, `http://${req.headers.host}`).searchParams.get('roomCode');
  
  if (roomCode) {
    if (!roomClients.has(roomCode)) {
      roomClients.set(roomCode, new Set());
    }
    roomClients.get(roomCode).add(ws);

    ws.on('close', () => {
      roomClients.get(roomCode).delete(ws);
      if (roomClients.get(roomCode).size === 0) {
        roomClients.delete(roomCode);
      }
    });
  }
});

function broadcastToRoom(roomCode, message) {
  if (roomClients.has(roomCode)) {
    for (const client of roomClients.get(roomCode)) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    }
  }
}

app.post('/api/rooms/:roomCode/join', (req, res) => {
  const { roomCode } = req.params;
  const { studentName } = req.body;

  const room = rooms.find(r => r.code === roomCode);

  if (room) {
    if (!room.students.includes(studentName)) {
      room.students.push(studentName);
      broadcastToRoom(roomCode, { type: 'student-joined', payload: { studentName, room } });
    }
    res.json(room);
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
});

app.get('/api/rooms/:roomCode', (req, res) => {
  const { roomCode } = req.params;
  const room = rooms.find(r => r.code === roomCode);

  if (room) {
    res.json(room);
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
});


app.get('/', (req, res) => {
  res.send('Backend is running!');
});

server.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});

module.exports = { app, server, wss };
