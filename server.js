const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');
var jwtAuth = require('socketio-jwt-auth');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
var jwt = require('jsonwebtoken');
const { error } = require('console');
var accessTokenSecret = "secret";
const users = require('./allowedUsers.js')

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.post('/login', (req, res) => {
  // Read username and password from request body
  const { username, password } = req.body;


console.log(username, password);
  // Filter user from the users array by username and password
  const user = users.find(u => { return u.username === username && u.password === password });

  if (user) {
      // Generate an access token
      const accessToken = jwt.sign({ username: user.username,  role: user.role }, accessTokenSecret);
      res.status(200).json(accessToken);
  } else {
    //return error
    res.status(401).json('Username or password incorrect');
  }
});

const botName = 'Advanced AI';

io.on('connection', socket => {
  //console.log(socket.handshake.auth); 
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});


const PORT = process.env.PORT || 3001;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));