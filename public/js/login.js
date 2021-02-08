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
     
     fetch('http://localhost:3001/login', {
        method: "POST",
        headers: headers,
        body: data
      })
      .then(res => res.json())
      .then(data => {
        if(data === true){
          window.location.replace("http://localhost:3001/chat.html")
        }
        else{
          return
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }