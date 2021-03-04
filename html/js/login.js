var form = document.getElementById('login');

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
      }
  }
  return "";
}

   function formHandler (event) {
    event.preventDefault();
    var obj = new Object();
    obj.username = document.getElementById('username').value;
    obj.password  = document.getElementById('password').value;
    obj.room = document.getElementById('room').value;
    var data= JSON.stringify(obj);
    var headers = {
        "Content-Type": "application/json",                                                                                                
        "Access-Control-Origin": "*"
     }
     
     fetch('http://localhost:8080/login', {
        method: "POST",
        headers: headers,
        body: data
      })
      .then(res => res.json())
      .then(data => {
        if(data.data === true){
          document.cookie = `authorization=${data.auth}; max-age=900000; SameSite=Lax;`;
          document.cookie = `username=${data.uName}; max-age=900000; SameSite=Lax;`;
          document.cookie = `room=${data.room}; max-age=900000; SameSite=Lax;`;
          window.location.replace("http://localhost:8080/chat.html")
        }
        else{
          return alert(data);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
