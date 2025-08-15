// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const {Server}=require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors(
    {
        origin:["http://localhost:3000","https://chat-app-frontend-link.netlify.app"],
        methods:["GET","POST"],
        credentials:true
    }
));
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
    res.send('Chat backend is running 🚀');
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://your-frontend-link.netlify.app"],
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
