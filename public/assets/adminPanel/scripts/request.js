(async function() {
    let object = {
        request: 'getData'
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
    console.log(data);
    document.querySelector("#username").innerHTML = data.username;
    for (let x = data.orders.orders.length - 1; x >= 0; x-- ) {
        let newOrderInHTML = `<div class="orderContainer"><div class="orderTitle statusOrdera closed" data-order="orderId">Zamówienie orderId <span style="float: right">od: nickTwitch</span></div><div class="orderInformation" style="display: none" data-order="orderId">Produkt: <span class="wynik">produkt</span>; id platnosci: <span class="wynik">idPlatnosci</span><span style="float: right">Data: <span class="wynik">tutajData</span></span><br>Status: zaplacoone: <span class="wynik">zaplacone</span> ; zreaalizowane: <span class="wynik">zrealizowane</span><div class="orderGrid"><div>Metoda platnosci: <span class="wynik">metodaPlatnosci</span><br>Kwota: <span class="wynik">kwota</span>PLN<br></div><div>Nick na twitchu: <span class="wynik">nickTwitch</span><br>Kanal na twitchu: <span class="wynik">channelTwitch</span><br>DiscordTag: <span class="wynik">discordTag</span><br>EmaiL: <span class="wynik">clientMail</span><br></div><div>Uzyty kupon: <span class="wynik">couponCode</span><br>Kupon na: <span class="wynik">couponDiscount</span>%<br>Opinia: <span class="wynik">opinia</span><br>Ocena: <span class="wynik">gwiazdki</span>⭐️<br></div></div></div></div>`;
        let keysInObject = Object.keys(data.orders.orders[x]);
        let valuesInObject = Object.values(data.orders.orders[x]);
        for (let y = 0; y < keysInObject.length; y++ ) {
            if (keysInObject[y] == "data") {
                newOrderInHTML = newOrderInHTML.replace("tutajData", valuesInObject[y]);
            } else if (valuesInObject[y] == false ) {
                newOrderInHTML = newOrderInHTML.replaceAll(keysInObject[y], `❌`);
            } else if (valuesInObject[y] == true) {
                newOrderInHTML = newOrderInHTML.replaceAll(keysInObject[y], `✅`);
            } else if (valuesInObject[y] == null) {
                newOrderInHTML = newOrderInHTML.replaceAll(keysInObject[y], `BRAK`);
            } else {
                newOrderInHTML = newOrderInHTML.replaceAll(keysInObject[y], valuesInObject[y]);
            }
        }
        if (data.orders.orders[x].zaplacone && data.orders.orders[x].zrealizowane) {
            newOrderInHTML = newOrderInHTML.replace(`statusOrdera`, `completed`);
        } else if (data.orders.orders[x].zaplacone && !data.orders.orders[x].zrealizowane) {
            newOrderInHTML = newOrderInHTML.replace(`statusOrdera`, `pending`);
        } else {
            newOrderInHTML = newOrderInHTML.replace(`statusOrdera`, `waiting`);
        }
        document.querySelector("#zamowienia").innerHTML += newOrderInHTML;
    }
    for (let x = 0; x < data.coupons.coupons.length; x++) {
        let stringPrzedmitow = "";
        if (data.coupons.coupons[x].forProducts.includes(0)) {
            stringPrzedmitow += "1 Tier 1 Miesiac, <br>"
        } if (data.coupons.coupons[x].forProducts.includes(1)) {
            stringPrzedmitow += "1 Tier 3 Miesiac, <br>"
        } if (data.coupons.coupons[x].forProducts.includes(2)) {
            stringPrzedmitow += "1 Tier 6 Miesiac, <br>"
        } if (data.coupons.coupons[x].forProducts.includes(3)) {
            stringPrzedmitow += "1 Tier 12 Miesiac, <br>"
        } if (data.coupons.coupons[x].forProducts.includes(4)) {
            stringPrzedmitow += "2 Tier 1 Miesiac, <br>"
        } if (data.coupons.coupons[x].forProducts.includes(5)) {
            stringPrzedmitow += "3 Tier 1 Miesiac, <br>"
        }
        document.querySelector(".couponsList").innerHTML += `<div class="couponElement"><div class="couponElementCode">${data.coupons.coupons[x].couponCode}</div><div class="couponElementDiscount">${data.coupons.coupons[x].couponDiscount}%</div><div class="couponElementUsesLeft">Pozostało uzyc: <b>${data.coupons.coupons[x].couponUsesLeft}</b></div><div class="couponElementProducts">Dla produktow: <br><span style="font-size: 75%">${stringPrzedmitow}</span></div></div>`
    }
    document.querySelectorAll(".orderTitle").forEach(e => {
        e.addEventListener("click",() => {
            console.log(e.dataset);
            document.querySelector(`.orderInformation[data-order='${e.dataset.order}']`).style.display = "block";
            e.classList.remove('closed');
            e.classList.add('opened');
        })
    })
})();