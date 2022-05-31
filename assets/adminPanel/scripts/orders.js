document.querySelectorAll(".orderTitle").forEach(e => {
    console.log(e);
    e.addEventListener("click", () => {
        document.querySelector(`orderInformation[data-order='${e.dataset.order}']`).style.display = "block";
        e.classList.remove('closed');
        e.classList.add('opened');
    })
})