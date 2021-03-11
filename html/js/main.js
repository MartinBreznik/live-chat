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
    var selected = document.getElementById("deleteSelector");
    var expiration = selected.options[selected.selectedIndex].value;
    expiration = moment().add(expiration, 'minutes');
    expiration = expiration.valueOf();
    var messageObject = {
        username: message.username,
        time: message.time,
        text: message.text,
        expire: expiration
    };
    document.cookie = `expiration=${messageObject.expire}; max-age=900000; SameSite=Lax;`;
    //add duration to message object
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
    document.querySelectorAll('.message').forEach(e => e.remove());
     value.forEach(element => {
        //add removal of expired messages
        var current = moment().valueOf();
        var diff = element.expire - current;
        if (diff <= 0) {
            element.expire = 0;
        }
            var objectToHtml = `<p class="meta">${element.username} <span>${element.time}</span></p>
            <p class="text">${element.text}</p>`;
            var div = document.createElement('div');
            div.classList.add('message');
            div.innerHTML = objectToHtml;
            document.querySelector('.chat-messages').appendChild(div);
    });
    //deleteExpired(value);
}   
//optimize this, make it more gracious
function deletePostphone(selected) {
    
    var timer;
    //clearInterval(showInterval);
    //console.log("1", showInterval);
    if(selected.value){
        alert('Chat history will be deleted in: ' + selected.value + 'minutes');
        timer = selected.value;
    }
    else if(selected){
        timer = selected;
    }
    else{
        console.log("timing error, deleting data to preserve privacy");
        timer = 0;
    }

    countDownDate = moment().add(timer, 'minutes');

    window.clearInterval(timer);

    //interval set to 5seconds, increase to improve performance
    var timer = window.setInterval(countdown, 5000);
  }

/*   function deleteExpired(value){
    value.forEach(element => {
        if(element.expire === 0){
            var removeIndex = value.map(function(item) { return item.expire; }).indexOf(0);
            value.splice(removeIndex, 1);
            console.log("deleted expired", value);
        }
    });
    
} */

function deleteMessages() {
    socket.emit('deleteAll', room);
}

var countdown = function() {
    var currentExp = getCookie("expiration");
    diff = countDownDate.diff(moment());
    if (diff <= 0) {
        if (typeof timer !== 'undefined'){
            timer = window.clearInterval(timer);
        }
        //deleteMessages();
        deferer(function () {
            console.log(currentExp, "epox");
            dbDeleteExpired(Number(currentExp))
            .then((value) => {
                //location.reload();
            })
            .catch((error) => {
                console.error("The Promise is rejected!", error);
            })
        });

    } 
    else if(diff === 300000){
        alert('Chat history will be deleted in: 5 minutes');
    }
    else if(diff === 150000){
        alert('Chat history will be deleted in: 2.5 minutes');
    }
    else if(diff === 60000){
        alert('Chat history will be deleted in: 1 minute');
    }
    else
    console.log(moment.utc(diff).format("mm:ss"));
  };

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
window.onload = deletePostphone(30);