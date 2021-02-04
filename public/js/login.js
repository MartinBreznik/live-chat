var form = document.getElementById('login');

   function formHandler (event) {
    event.preventDefault();
    var obj = new Object();
    obj.username = document.getElementById('username').value;
    obj.password  = document.getElementById('password').value;
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
      .then(data => console.log(data))
      .catch((error) => {
        console.error('Error:', error);
      })

/*      fetch("http://localhost:3001/login", {
         method: "POST",
         headers: headers,
         body:  data
     })
     .then(res => res.json())
     .then(data => console.log(data)) */


/*      .then(function(response){ 
         var data = response.body;
         console.log(response);
         return data.json(); 
     })
     .then(function(data){ 
         console.log(data)
     } ); */


/*    fetch('http://localhost:3001/login', {
            method: 'post',
            body: data
          })
          .then(response => {
            var newdata = response.json();
            alert(newdata);
            //localStorage['jwt'] = data; // only strings
            window.location.replace("http://localhost:3001/chat.html") 
            
          })
          .catch((error) => {
            console.error('Error:', error);
          }); */
      } 
      
