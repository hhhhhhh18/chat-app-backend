// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
    res.send('Chat backend is running 🚀');
});

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "*", // You can replace * with your frontend URL for better security
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Use dynamic port for deployment (Cyclic provides PORT env variable)
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
