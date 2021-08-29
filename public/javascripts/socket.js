const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const content = document.getElementById('content');


var username; 

const x = async () => {
  var userdetail = await axios({ method: 'GET', url: '/v1/users/getMe' });
  
  username = userdetail.data.user.username;
  var room = document.getElementById('room_name').innerText;
  
  console.log(room);
  
  const socket = io();
  console.log(socket);
  
  socket.emit('join-room', { username, room });

  
  socket.on("user-connected", (username) => {
    log('user connected');
  });

  // Get room and users
  socket.on('room-users', ({ room, users }) => {
    outputUsers(users);
  });

  //Message from server
  socket.on('message', (message) => {
    outputMessage(message);

    // Scroll Down
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  //Message from users
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    let msg = e.target.elements.msg.value;
    msg = msg.trim();

    if (!msg) {
      return false;
    }

    // Emite message to server
    socket.emit('user-message', msg);

    // clean input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
  });

  // Output Message to DOM
  function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');

    const usernameP = document.createElement('p');
    usernameP.classList.add('meta');
    usernameP.innerText = message.username;
    usernameP.innerHTML += `<span> ${message.time}</span>`;

    div.appendChild(usernameP);

    const messageTextP = document.createElement('p');
    messageTextP.classList.add('text');
    messageTextP.innerText = message.text;

    div.appendChild(messageTextP);

    document.querySelector('.chat-messages').appendChild(div);
  }

  // Add Users to DOM
  function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
      const li = document.createElement('li');
      li.innerText = user.username;
      li.id = user.id;
      li.classList.add('mb-1');
      li.style.fontWeight = 'bold';
      userList.appendChild(li);
    });
  }
};

x();
