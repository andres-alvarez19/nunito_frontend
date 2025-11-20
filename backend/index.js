const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// In-memory data stores
const teachers = [];
const rooms = [];
const gameResults = [];

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/api/rooms', (req, res) => {
  console.log('Creating a new room with data:', req.body);
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
  console.log('New room created:', newRoom);
  res.status(201).json(newRoom);
});
app.post('/api/rooms/:roomCode/results', (req, res) => {
  console.log(`Submitting results for room ${req.params.roomCode} with data:`, req.body);
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
    console.log('New result submitted:', result);
    broadcastToRoom(roomCode, { type: 'results-submitted', payload: { studentName, results } });
    res.status(201).json(result);
  } else {
    console.log(`Room not found: ${roomCode}`);
    res.status(404).json({ message: 'Room not found' });
  }
});

app.get('/api/rooms/:roomCode/results', (req, res) => {
  console.log(`Getting results for room ${req.params.roomCode}`);
  const { roomCode } = req.params;
  const results = gameResults.filter(r => r.code === roomCode);
  console.log(`Found ${results.length} results for room ${roomCode}`);
  res.json(results);
});



app.get('/api/rooms/all/results', (req, res) => {
  console.log('Getting all results');
  res.json(gameResults);
});



app.post('/api/teachers/register', (req, res) => {
  console.log('Registering a new teacher with data:', req.body);
  const { name, email, password } = req.body;
  if (teachers.find(t => t.email === email)) {
    console.log(`Teacher already exists: ${email}`);
    return res.status(400).json({ message: 'Teacher already exists' });
  }
  const newTeacher = { name, email, password };
  teachers.push(newTeacher);
  console.log('New teacher registered:', newTeacher);
  res.status(201).json(newTeacher);
});

app.post('/api/teachers/login', (req, res) => {
  console.log('Logging in a teacher with data:', req.body);
  const { email, password } = req.body;
  const teacher = teachers.find(t => t.email === email && t.password === password);
  if (teacher) {
    console.log(`Teacher logged in: ${email}`);
    res.json(teacher);
  } else {
    console.log(`Invalid credentials for: ${email}`);
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store clients per room
const roomClients = new Map();

wss.on('connection', (ws, req) => {
  const roomCode = new URL(req.url, `http://${req.headers.host}`).searchParams.get('roomCode');
  console.log(`New WebSocket connection for room: ${roomCode}`);
  
  if (roomCode) {
    if (!roomClients.has(roomCode)) {
      roomClients.set(roomCode, new Set());
    }
    roomClients.get(roomCode).add(ws);
    console.log(`Client added to room ${roomCode}. Total clients in room: ${roomClients.get(roomCode).size}`);

    ws.on('close', () => {
      console.log(`WebSocket connection closed for room: ${roomCode}`);
      roomClients.get(roomCode).delete(ws);
      if (roomClients.get(roomCode).size === 0) {
        roomClients.delete(roomCode);
        console.log(`Room ${roomCode} is now empty and has been removed.`);
      }
    });

    ws.on('message', (message) => {
      console.log(`Received message from room ${roomCode}: ${message}`);
    });
  }
});

function broadcastToRoom(roomCode, message) {
  console.log(`Broadcasting message to room ${roomCode}:`, message);
  if (roomClients.has(roomCode)) {
    for (const client of roomClients.get(roomCode)) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    }
  }
}

app.post('/api/rooms/:roomCode/join', (req, res) => {
  console.log(`Student joining room ${req.params.roomCode} with data:`, req.body);
  const { roomCode } = req.params;
  const { studentName } = req.body;

  const room = rooms.find(r => r.code === roomCode);

  if (room) {
    if (!room.students.includes(studentName)) {
      room.students.push(studentName);
      console.log(`Student ${studentName} joined room ${roomCode}`);
      broadcastToRoom(roomCode, { type: 'student-joined', payload: { studentName, room } });
    }
    res.json(room);
  } else {
    console.log(`Room not found: ${roomCode}`);
    res.status(404).json({ message: 'Room not found' });
  }
});

app.get('/api/rooms/:roomCode', (req, res) => {
  console.log(`Getting details for room ${req.params.roomCode}`);
  const { roomCode } = req.params;
  const room = rooms.find(r => r.code === roomCode);

  if (room) {
    console.log(`Found room:`, room);
    res.json(room);
  } else {
    console.log(`Room not found: ${roomCode}`);
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
