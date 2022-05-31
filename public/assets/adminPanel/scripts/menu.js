document.querySelectorAll('.navbarCTitle').forEach(e => {
    e.addEventListener("click", () => {
        document.querySelectorAll('.navbarCTitle').forEach(element => {
            element.classList.remove('selectedNavbar');
        })
        document.querySelectorAll(".mainMenu").forEach(element => {
            element.style.display = "none";
        })
        document.querySelector(`#${e.dataset.section}`).style.display = "block";
        e.classList.add('selectedNavbar');
    })
});


document.querySelector(".logOut").addEventListener("click", async () => {
    let object = {
        request: 'logout'
    }
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(object)
    };
    const response = await fetch('/adminPanel', options);
    const data = await response.json();
    if (data.status == "loggedout") {
        location.reload();
    }
})