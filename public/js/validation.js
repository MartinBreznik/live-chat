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

function checkCookies(){

    var bearer = getCookie('authorization');
    var logedInAs = getCookie('username');

    if(bearer && logedInAs){
        console.log("The page is redirecting")
    }
    else{
        document.location.replace("http://localhost:3001/");
    }       
}
window.onload = checkCookies(); 