const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const jwt = require('jsonwebtoken');
var cors = require('cors')
//add secret file
const accessTokenSecret = "secret";
const users = require('./allowedUsers.js')
const cookieParser = require('cookie-parser')
const botName = 'Advanced AI';

app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());
//must be here // Set static folder
app.use(express.static(path.join(__dirname, 'html')));

app.use('/login', (req, res, next) => {
  const { username, password, room } = req.body;
  const user = users.find(u => { return u.username === username && u.password === password });
  //check if user has access to room
  const cookie = req.cookies.cookieName;
  var resPayload;
  if (user) {
    const hasAccess = user.rooms.find(element => element === room);
    if (hasAccess) {
      // Generate an access token
      const accessToken = jwt.sign({ username: user.username, role: user.role }, accessTokenSecret);
      if (cookie === undefined) {
        // add bearer to user
        user.bearer = accessToken;
        resPayload = {
          data: true, 
          auth: accessToken,
          uName: username,
          room: room
        }
        //add encryption and better response
	    res.status(200).json(resPayload);
      }
      else {
        res.status(401).json('Already loged in aka. cookie present');
      }
      next();
    }
    else {
      res.status(403).json("You're Not allowed to access this server");
    }
  }
  else {
    //return error
    res.status(401).json('Username or password incorrect');
  }
});



io.on('connection', socket => {
  const resBearer = users.find(u => { return u.bearer === socket.handshake.auth.token.bearer });
  if (resBearer && socket.handshake.auth.token.bearer === resBearer.bearer) {
    //add ALL chatroom logic here

    socket.on('joinRoom', ({ username, room }) => {

      const user = userJoin(socket.id, username, room);
      console.log("usr", user);
      socket.join(user.room);

      // Welcome current user
      //socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

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

    socket.on('deleteAll', (roomToDelete) => {
      io.emit('deleteAllMessages', roomToDelete)

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
  else {
    //add redirect for FRONTEND
    socket.disconnect(true)
    console.log("wrong authentication");
  }
  // Runs when client disconnects

});

let port = process.env.PORT || 8080;
server.listen(port, "0.0.0.0", () => {
    console.log('Server is up and running on port numner ' + port);
});


//const PORT = process.env.PORT || 8080;

//server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
