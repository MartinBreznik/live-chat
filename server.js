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
var cookieParser = require('cookie-parser')

app.use(cookieParser());
app.use(bodyParser.json());

app.use('/login', (req, res, next) => {
  // Read username and password from request body
  const { username, password, room } = req.body;
  
   console.log("req data:", username, password, room);
  // Filter user from the users array by username and password
  const user = users.find(u => { return u.username === username && u.password === password });
  const cookie = req.cookies.cookieName;
  if (user) {
      // Generate an access token
      const accessToken = jwt.sign({ username: user.username,  role: user.role }, accessTokenSecret);
      if (cookie === undefined){
        // add bearer to user
        user.bearer = accessToken;
        res.cookie('authorization', accessToken, { maxAge: 900000, httpOnly: false });
        res.cookie('username', username, { maxAge: 900000, httpOnly: false });
        res.cookie('room', room, { maxAge: 900000, httpOnly: false });
        //add encryption and better response
        res.status(200).json(true);
      }
      else{
        res.status(401).json('Already loged in aka. cookie present');
    }
    next();
  }
  else {
    //return error
    res.status(401).json('Username or password incorrect');
  }
  
});

//must be here // Set static folder
app.use(express.static(path.join(__dirname, 'public')));


const botName = 'Advanced AI';

io.on('connection', socket => {
  const resBearer = users.find(u => { return u.bearer === socket.handshake.auth.token.bearer });
  if( resBearer && socket.handshake.auth.token.bearer === resBearer.bearer){
    //add ALL chatroom logic here

    socket.on('joinRoom', ({ username, room}) => {

      const user = userJoin(socket.id, username, room);
      console.log("usr", user);
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
  }
  else{
    //add wrong auth fallback
    console.log("wrong authentication");
  }

  // Runs when client disconnects

});


const PORT = process.env.PORT || 3001;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));