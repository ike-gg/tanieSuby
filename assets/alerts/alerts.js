let newAlert = (heading, text) => {
    document.querySelector(".alertH").innerHTML = heading;
    document.querySelector(".alertP").innerHTML = text;
    document.querySelector(".alertContainer").style.display = "grid";
    setTimeout(() => {
        document.querySelector(".alertContainer").style.opacity = "1";
        document.querySelector(".alertBox").style.transform = "translateY(0)";
        document.querySelector(".alertBox").style.opacity = "1";
    }, 100);
}

document.querySelector(".alertButton").addEventListener('click', () => {
    document.querySelector('.alertBox').style.transform = "translateY(100px)";
    document.querySelector('.alertBox').style.opacity = "0";
    document.querySelector('.alertContainer').style.opacity = "0";
    setTimeout(() => {
        document.querySelector('.alertContainer').style.display = "none";
        document.querySelector('.alertBox').style.transform = "translateY(-100px)";
    }, 400);
});