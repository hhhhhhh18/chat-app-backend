const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
app.use(cors({
  origin:['http://localhost:3000','https://hhhhhhh18.github.io'],
  methods:['GET','POST'],
  credentials:true,
}));

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

let users = {}; // socketId -> username mapping

function getUniqueUsernames() {
  return [...new Set(Object.values(users))];
}

io.on('connection', (socket) => {
  const username = socket.handshake.query.username || 'Anonymous';
  users[socket.id] = username;

  // Broadcast system message when user joins
  socket.broadcast.emit('systemMessage', {
    id: 'join-' + Date.now(),
    text: `${username} has joined the chat`,
    type: 'join',
    timestamp: Date.now()
  });

  // Update active users list
  io.emit('activeUsers', getUniqueUsernames());

  socket.on('disconnect', () => {
    // Broadcast system message when user leaves
    socket.broadcast.emit('systemMessage', {
      id: 'left-' + Date.now(),
      text: `${users[socket.id]} has left the chat`,
      type: 'left',
      timestamp: Date.now()
    });

    delete users[socket.id];
    io.emit('activeUsers', getUniqueUsernames());
  });

  // Handle text message
  socket.on('sendMessage', (data) => {
    socket.emit('message', { ...data, status: 'sent' });
    socket.broadcast.emit('message', { ...data, status: 'delivered' });
  });

  // Handle file message
  socket.on('sendFile', (msg) => {
    socket.emit('fileMessage', { ...msg, status: 'sent' });
    socket.broadcast.emit('fileMessage', { ...msg, status: 'delivered' });
  });

  // Delivery and read acknowledgments
  socket.on('messageReceived', ({ msgId, senderSocketId }) => {
    if (senderSocketId) {
      io.to(senderSocketId).emit('messageStatusUpdate', { msgId, status: 'delivered' });
    }
  });

  socket.on('readMessage', ({ msgId, senderSocketId }) => {
    if (senderSocketId) {
      io.to(senderSocketId).emit('messageStatusUpdate', { msgId, status: 'read' });
    }
  });

  // Typing indicators
  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username);
  });

  socket.on('stopTyping', (username) => {
    socket.broadcast.emit('stopTyping', username);
  });

  // Message reactions
  socket.on('reactMessage', (msgId, emoji) => {
    io.emit('reactUpdate', { msgId, emoji });
  });
});

server.listen(3001, () => {
  console.log('Server running on port 3001');
});
