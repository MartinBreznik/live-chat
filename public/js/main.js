const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
//getCookie function called from validation.js
const bearer = getCookie('authorization');
const room = getCookie('room');
const username = getCookie('username');
const socket = io({auth: {token: {username: username, bearer: bearer} }});

//join chatroom ADD PASSWORD HERE
socket.emit('joinRoom', { username, room})

//get room and users
socket.on('roomUsers', ({ room, users}) => {
    outputRoomName(room);
    outputUsers(users);
    console.log("roomusers", room, users);
});

//Message from server
socket.on('message', message => {
    outputMessage(message);

    // scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  //message submit

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    checkCookies();
    //get message text
    const msg = e.target.elements.msg.value;
    
    //emit message to server
    socket.emit('chatMessage', msg);

    //clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});
function outputMessage(message) {
    checkCookies();
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">${message.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div);
}
//add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}
// add users to DOM
function outputUsers(users){
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}`;
}
socket.on('disconnect', function () {
    alert('User sesion expired, please log in');
    window.location = "/"; //page you want to redirect
});