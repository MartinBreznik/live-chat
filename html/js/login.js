var form = document.getElementById('login');

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
     
     fetch('http://ufo.si:8080/login', {
        method: "POST",
        headers: headers,
        body: data
      })
      .then(res => res.json())
      .then(data => {
        if(data === true){
          window.location.replace("http://ufo.si/chat.html")
        }
        else{
          return alert(data);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
