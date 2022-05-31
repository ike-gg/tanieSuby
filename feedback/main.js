const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const orderId = urlParams.get('order');
let stars = 0;

if (orderId == null) {
    location.href = "https://taniesuby.eu"
}

let onBoard = async () => {
    let object = {
        orderId
    };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(object)
    };
    const response = await fetch('/feedback', options);
    const data = await response.json();
    console.log(data);
    if (data.status == "waitingForFeedback") {
        document.querySelector(".giveFeedback").style.display = "block";
        document.querySelector("#messageHere").innerHTML = `<b style="font-size:34px">Cześć ${data.order.nickTwitch}!</b><br>Mamy nadzieje ze jestes zadowolony z naszej usługi i z suba na kanale ${data.order.channelTwitch}!<br><br><span style="font-size: 26px">Dziękujemy ❤️</span>`
    } else if (data.status == `feedbackAlredyExists`) {
        document.querySelector(".status").innerHTML = data.message;
    } else if (data.status == `lookingForward`) {
        document.querySelector(".status").innerHTML = data.message;
    } else if (data.status == `orderDoesntExists`) {
        document.querySelector(".status").innerHTML = data.message;
    }
};

onBoard();

document.querySelectorAll(".star").forEach(e => {
    e.addEventListener("click", () => {
        document.querySelectorAll(".star").forEach(element => {
            element.classList.remove('selectedStar');
        });
        stars = e.dataset.star;
        for (let x = 1; x <= e.dataset.star; x++) {
            document.querySelector(`#star${x}`).classList.add("selectedStar");
        }
    })
})

document.querySelector(".sendFeedback").addEventListener("click", async () => {
    let feedbackText = document.querySelector("#feedbackText").value;
    if (feedbackText.length < 5 ) {
        alert("Opinia ma za mało znaków!")
    } else if (feedbackText.length > 1000) {
        alert("Opinia ma za duzo znaków!")
    } else if (stars == 0) {
        alert("Zaznacz gwiazdkę odpowiadającą opinii w skali od 1 do 5.")
    } else {
        let object = {
            orderId,
            feedbackText,
            stars
        };
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify(object)
        };
        const response = await fetch('/nowyFeedback', options);
        const data = await response.json();
        if (data.status == "approved") {
            alert("Dziękujemy za opinie! <3");
            location.href = "https://taniesuby.eu";
        }
    }
})