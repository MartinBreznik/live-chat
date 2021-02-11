const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
//getCookie function called from validation.js
const bearer = getCookie('authorization');
const room = getCookie('room');
const username = getCookie('username');
const socket = io({auth: {token: {username: username, bearer: bearer} }})
//store data better on fe
const allMessages = [];
var messageHtml;

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
    //fix all messages data storing
    console.log("before", allMessages)
    outputMessage(message, false, allMessages);
    console.log("after", allMessages)
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
function outputMessage(message, reloaded, allMessages) {
    if(reloaded === false){
        checkCookies();
        var messageHtml = `<p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">${message.text}</p>`;
        document.querySelectorAll('.message').forEach(e => e.remove());
        allMessages.push(messageHtml);
        allMessages.forEach(element => {
            var div = document.createElement('div');
            div.classList.add('message');
            div.innerHTML = element;
            document.querySelector('.chat-messages').appendChild(div);
            });
    }
    else {
        alert("all", allMessages);
        allMessages.forEach(element => {
            var div = document.createElement('div');
            div.classList.add('message');
            div.innerHTML = element;
            document.querySelector('.chat-messages').appendChild(div);
            });
    }
    return allMessages;
}
function deleteMessages(){
    socket.emit('deleteAll', room);
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
    //potential problem

        //causes disconnect and redirect on firefox
        revokeAccess();

        alert('User sesion expired, please log in');
});

socket.on("deleteAllMessages", (roomToDelete) => {
    if(room === roomToDelete)
    {
        console.log("array present messages", allMessages);
        allMessages = [];
        document.querySelectorAll('.message').forEach(e => e.remove());
        location.reload();
    }
    else{
        alert("No messages to delete")
    }
    alert("deleted", roomToDelete);
  });

  window.onload = outputMessage('', true, allMessages); 