function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
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

function revokeAccess(){
    document.cookie = "authorization=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "room=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.location.replace("http://localhost:3001/");
}

function checkCookies(){
    var bearer = getCookie('authorization');
    var logedInAs = getCookie('username');
    var room = getCookie('room');

    if(bearer && logedInAs && room){
        console.log("The page is redirecting")
    }
    else{
        revokeAccess();
    }       
}

window.onload = checkCookies(); 