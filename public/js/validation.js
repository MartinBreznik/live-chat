
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

function revokeAccess() {
    document.cookie = "authorization=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;";
    document.cookie = "room=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;";
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;";

    deferer(function () {
        dbDelete()
            .then(() => {
                console.log("success")
            })
            .catch((error) => {
                console.error("The Promise is rejected!", error);
            })
    });

    window.location.replace("http://ufo.si:8080")
}

function checkCookies() {
    var bearer = getCookie('authorization');
    var logedInAs = getCookie('username');
    var room = getCookie('room');
    var isFirefox = typeof InstallTrigger !== 'undefined';

    //stop firefox refresh
    console.log("firefox:", isFirefox);
    if (bearer && logedInAs && room) {

        console.log("The page is redirecting")
    }
    else {
        revokeAccess();
    }
}

function defer(method) {
    if (window.dbPost) {
        method();
    } else {
        setTimeout(function () { defer(method) }, 50);
    }
}

function deferer(method) {
    if (window.dbDelete) {
        method();
    } else {
        setTimeout(function () { deferer(method) }, 50);
    }
}

//potential problem
window.onload = checkCookies(); 
