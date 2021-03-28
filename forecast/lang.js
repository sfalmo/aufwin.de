if (localStorage.getItem("lang") == "en") {
    console.log(localStorage.getItem("lang"));
    document.write("<script src='lang/en.js'></script>");
} else {
    document.write("<script src='lang/de.js'></script>");
}
