var gLegalNotice = document.getElementById("legalNotice");
var gFAQ = document.getElementById("faq");
var gInfoModalBase = document.getElementById("infoModalBase");
var gInfoHeaderContent = document.getElementById("infoHeaderContent");
var gInfoBodyContent = document.getElementById("infoBodyContent");
var gInfoClose = document.getElementById("infoClose");

document.title = dict["HTMLTitle"];
gLegalNotice.innerHTML = dict["LegalNotice"];
gFAQ.innerHTML = dict["FAQ"];

gLegalNotice.onclick = (event) => {
    event.preventDefault();
    gInfoHeaderContent.innerHTML = dict["LegalNotice"];
    getContent("legalNotice.html");
    gInfoModalBase.style.display = "block";
};

gFAQ.onclick = (event) => {
    event.preventDefault();
    gInfoHeaderContent.innerHTML = dict["FAQ"];
    getContent("faq.html");
    gInfoModalBase.style.display = "block";
};

gInfoClose.onclick = () => {
    gInfoModalBase.style.display = "none";
};

window.onclick = (event) => {
    if (event.target == gInfoModalBase) {
        gInfoModalBase.style.display = "none";
    }
};


function getContent(url) {
    fetch("/" + lang + "/" + url)
        .then(response => {
            return response.text();
        })
        .then(text => {
            gInfoBodyContent.innerHTML = text;
            gInfoBodyContent.scrollTop = 0;
        })
        .catch(err => {
            gInfoBodyContent.innerHTML = dict["PageNotFound"];
        });
}
