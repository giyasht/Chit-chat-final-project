const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { static } = require('express');

const formatMessage = require('./utils/messages');
const { userJoin, getRoomUsers, getUser, userLeave } = require('./utils/users');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: `${__dirname}/config.env` });
const app = require(`${__dirname}/app.js`);

app.set('view engine', 'ejs');

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Database Successfully Connected'));

var server = http.createServer(app),
  socketio = require('socket.io'),
  io = socketio(server);

const botName = 'Chat Bot';
io.on('connection', (socket) => {
  console.log('connection established');
  socket.on('join-room', ({ id, friendsid, username, room }) => {
    const user = userJoin(username, room);

    socket.join(user.room);

    socket.emit('message', formatMessage(botName, 'Welcome to Chatting page!'));

    // Broadcast when  a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(
          botName,
          `${user.username} has joined the chat, be nice with him/her`
        )
      );

    // Send users and Room info
    io.to(user.room).emit('room-users', {
      room: user.room,
      users: getRoomUsers(user.room),
    });

    // Listen for chatMessage
    socket.on('user-message', (msg) => {
      const user = getUser(id);
      io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
      const user = userLeave(id);

      if (user) {
        io.to(user.room).emit(
          'message',
          formatMessage(botName, `${user.username} has left the chat`)
        );

        // Send users and room info
        io.to(user.room).emit('room-users', {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  });
});

const port = process.env.PORT || 3000;
const running_server = server.listen(port, () => {
  console.log('Visit http://localhost:3000/ to continue to our website.');
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDELED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  running_server.close(() => {
    process.exit(1);
  });
});
