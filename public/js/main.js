const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
//getCookie function called from validation.js
const bearer = getCookie('authorization');
const room = getCookie('room');
const username = getCookie('username');
const socket = io({ auth: { token: { username: username, bearer: bearer } } })
var messageHtml;
//join chatroom ADD PASSWORD HERE
socket.emit('joinRoom', { username, room })

//get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
    console.log("roomusers", room, users);
});

//Message from server
socket.on('message', message => {
    //fix all messages data storing
    outputMessage(message, false);
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
function outputMessage(message, reloaded) {
    checkCookies();
    var messageObject = {
        username: message.username,
        time: message.time,
        text: message.text
    }
    if (reloaded === false) {
        defer(function () {
            window.dbPost(messageObject)
                .then((value) => {
                    mapToDom(value);
                })
                .catch((error) => {
                    console.error("The Promise is rejected!", error);
                })
        });
    }
    else if (reloaded === true) {
        defer(function () {
            window.dbPost(false)
                .then((value) => {
                    mapToDom(value);
                })
                .catch((error) => {
                    console.error("The Promise is rejected!", error);
                })
        });
    }
}
//map saved elements to dom
function mapToDom(value) {
    if (value === undefined || value === null || value === '' || value === false) {
        return
    }
    console.log("success", value)
    document.querySelectorAll('.message').forEach(e => e.remove());
    value.forEach(element => {
        var objectToHtml = `<p class="meta">${element.username} <span>${element.time}</span></p>
        <p class="text">${element.text}</p>`;
        var div = document.createElement('div');
        div.classList.add('message');
        div.innerHTML = objectToHtml;
        document.querySelector('.chat-messages').appendChild(div);
    });

}
function deleteMessages() {
    socket.emit('deleteAll', room);
}
//add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}
// add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}`;
}

socket.on('disconnect', function () {
    //potential problem
    deferer(function () {
        dbDelete()
            .then((value) => {
                console.log("success")
            })
            .catch((error) => {
                console.error("The Promise is rejected!", error);
            })
    });
    location.reload();
    //causes disconnect and redirect on firefox
    revokeAccess();

    alert('User sesion expired, please log in');
});

socket.on("deleteAllMessages", (roomToDelete) => {
    if (room === roomToDelete) {
        deferer(function () {
            dbDelete()
                .then((value) => {
                    console.log("success")
                })
                .catch((error) => {
                    console.error("The Promise is rejected!", error);
                })
        });
        location.reload();
    }
    else {
        alert("No messages to delete")
    }
    alert("deleted", roomToDelete);
});

window.onload = outputMessage('', true);

