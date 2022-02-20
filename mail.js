function writeEmail() {
    var c = "lto:i";
    var h = "fo";
    var b = "ef='mai";
    var e = 39 + 25;
    var a = "<a hr";
    var g = "in";
    e = String.fromCharCode(e);
    var f = "aufwin.de";
    var d = "nfo";
    return a + b + c + d + e + f + "'>" + g + h + e + f + "</a>";
}
setTimeout(() => {
    document.getElementById("email").innerHTML = writeEmail();
}, 300);
