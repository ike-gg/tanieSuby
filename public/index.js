let paymentMethod = undefined;
let subTier = undefined;
let subDuration = undefined;
let priceForService = undefined;
let priceForServiceINT = undefined;
let productId = undefined;
let sellixProductId = ["1"];
let couponCodeForOrder = null;

/*
0- 1 tier 1 miesiac,
1- 1 tier 3 miesiace,
2- 1 tier 6 miesiecy,
3- 1 tier 12 miesiecy,
4- 2 tier 1 miesiac,
5- 3 tier 1 miesiac
*/

document.addEventListener("scroll", (e) => {
  document.querySelectorAll(".stepNumber").forEach((e) => {
    e.style.transform = `translateX(-${window.scrollY / 15}px)`;
  });
  document.querySelector("#stars-container").style.transform = `translateY(-${
    window.scrollY / 10
  }px)`;
});

let getProduct = () => {
  if (subTier == 1) {
    if (subDuration == 1) {
      priceForService = "9,20 PLN";
      priceForServiceINT = 9.2;
      productId = 0;
      document.querySelector("#sellixButton").dataset.sellixProduct =
        sellixProductId[0];
    } else if (subDuration == 3) {
      priceForService = "26,00 PLN";
      priceForServiceINT = 26;
      productId = 1;
      document.querySelector("#sellixButton").dataset.sellixProduct =
        sellixProductId[1];
    } else if (subDuration == 6) {
      priceForService = "50,00 PLN";
      priceForServiceINT = 50;
      productId = 2;
      document.querySelector("#sellixButton").dataset.sellixProduct =
        sellixProductId[2];
    } else if (subDuration == 12) {
      priceForService = "100,00 PLN";
      priceForServiceINT = 100;
      productId = 3;
      document.querySelector("#sellixButton").dataset.sellixProduct =
        sellixProductId[3];
    }
  } else if (subTier == 2) {
    if (subDuration == 1) {
      priceForService = "18,00 PLN";
      priceForServiceINT = 18;
      productId = 4;
      document.querySelector("#sellixButton").dataset.sellixProduct =
        sellixProductId[4];
    }
  } else if (subTier == 3) {
    if (subDuration == 1) {
      priceForService = "50,00 PLN";
      priceForServiceINT = 50;
      productId = 5;
      document.querySelector("#sellixButton").dataset.sellixProduct =
        sellixProductId[5];
    }
  }
};

let checker = () => {
  document.querySelector(".qCopuon").style.display = "block";
  document.querySelector(".haveCoupon").style.display = "none";
  document.querySelector(".couponApplied").style.display = "none";
  document.querySelector("#couponCode").value = "";
  let check = 0;
  if (paymentMethod == "paypal" || paymentMethod == "blik") check++;
  if (subTier == 1 || subTier == 2 || subTier == 3) check++;
  if (
    subDuration == 1 ||
    subDuration == 3 ||
    subDuration == 6 ||
    subDuration == 12
  )
    check++;
  if (check == 3) {
    getProduct();
    document.querySelectorAll(".priceBox").forEach((e) => {
      e.innerHTML = priceForService;
    });
    if (paymentMethod == "paypal") {
      document.querySelector(".paypal").style.display = "block";
      document.querySelector(".blik").style.display = "none";
      document.querySelector("#validator").style.display = "none";
    } else if (paymentMethod == "blik") {
      document.querySelector(".paypal").style.display = "none";
      document.querySelector(".blik").style.display = "block";
      document.querySelector("#validator").style.display = "none";
    }
  } else {
    document.querySelectorAll(".check").forEach((e) => {
      e.style.display = "none";
    });
    document.querySelector("#validator").style.display = "inline-block";
  }
};

document.querySelectorAll(`.offerPaymentMethod > button`).forEach((element) => {
  element.addEventListener("click", () => {
    document.querySelectorAll(`.offerPaymentMethod > button`).forEach((el) => {
      el.classList.remove("selected");
    });
    element.classList.add("selected");
    paymentMethod = element.dataset.payment;
    checker();
  });
});

document.querySelectorAll(`.offerTierSub > button`).forEach((element) => {
  element.addEventListener("click", () => {
    document.querySelectorAll(`.offerTierSub > button`).forEach((el) => {
      el.classList.remove("selected");
    });
    element.classList.add("selected");
    subTier = element.dataset.tier;
    if (subTier != 1) {
      document.querySelector("#hideMeTier").style.display = "none";
      document.querySelectorAll(`.offerDurationSubButton`).forEach((el) => {
        el.classList.remove("selected");
      });
      subDuration = undefined;
    } else {
      document.querySelector("#hideMeTier").style.display = "inline-block";
    }
    checker();
  });
});

document.querySelectorAll(`.offerDurationSubButton`).forEach((element) => {
  element.addEventListener("click", () => {
    document.querySelectorAll(`.offerDurationSubButton`).forEach((el) => {
      el.classList.remove("selected");
    });
    element.classList.add("selected");
    subDuration = element.dataset.duration;
    checker();
  });
});

document
  .querySelector("#sendFormHOTPAY")
  .addEventListener("click", async () => {
    if (paymentMethod != "blik") {
      location.reload();
    } else {
      let nickTwitch = document.querySelector("#twitchNickname").value;
      let channelTwitch = document.querySelector("#twitchChannel").value;
      let discordTag = document.querySelector("#discordTag").value;
      let clientMail = document.querySelector("#emailBlik").value;
      if (
        nickTwitch == "" ||
        channelTwitch == "" ||
        discordTag == "" ||
        clientMail == ""
      ) {
        document.querySelectorAll("#order > input").forEach((e) => {
          if (e.value == "") {
            e.classList.add("pleaseFillMe");
            setTimeout(() => {
              e.classList.remove("pleaseFillMe");
            }, 500);
          }
        });
      } else {
        let HPKwota = document.querySelector("#hotpayKwota");
        let HPNazwaUslugi = document.querySelector("#hotpayNazwaUslugi");
        if (subTier == 1) {
          if (subDuration == 1) {
            HPKwota.value = "9.2";
            HPNazwaUslugi.value = "1 Tier 1 Miesiąc";
          } else if (subDuration == 3) {
            HPKwota.value = "26";
            HPNazwaUslugi.value = "1 Tier 3 Miesiące";
          } else if (subDuration == 6) {
            HPKwota.value = "50";
            HPNazwaUslugi.value = "1 Tier 6 Miesięcy";
          } else if (subDuration == 12) {
            HPKwota.value = "100";
            HPNazwaUslugi.value = "1 Tier 12 Miesięcy";
          }
        } else if (subTier == 2) {
          if (subDuration == 1) {
            HPKwota.value = "18";
            HPNazwaUslugi.value = "2 Tier 1 Miesiąc";
          }
        } else if (subTier == 3) {
          if (subDuration == 1) {
            HPKwota.value = "50";
            HPNazwaUslugi.value = "3 Tier 1 Miesiąc";
          }
        }
        let nickTwitch = document.querySelector("#twitchNickname").value;
        let channelTwitch = document.querySelector("#twitchChannel").value;
        let discordTag = document.querySelector("#discordTag").value;
        let clientMail = document.querySelector("#emailBlik").value;
        let object = {
          metodaPlatnosci: paymentMethod,
          kwota: HPKwota.value,
          produkt: HPNazwaUslugi.value,
          nickTwitch,
          channelTwitch,
          discordTag,
          clientMail,
          couponCodeForOrder,
          productId,
        };
        document.querySelector(".offer").classList.add("untouchable");
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(object),
        };
        const response = await fetch("/noweZamowienieHotPay", options);
        const data = await response.json();
        console.log(data);
        if (data.order == "created") {
          document.querySelector("#hotpayIdZamowienia").value = data.orderId;
          document.querySelector("#order").submit();
        } else if (data.order == "couponExpired") {
          newAlert(
            "Niestety.",
            "Kupon który wprowadziłeś prawdopodobnie został wykorzystany. (Ktoś wykorzystał go przed Tobą.) Jezeli myslisz ze to problem po naszej stronie- skontaktuj się z nami!"
          );
          document.querySelector(".offer").classList.remove("untouchable");
        } else if (data.order == `couponnotfound`) {
          document.querySelector(".offer").classList.remove("untouchable");
          newAlert(
            "Niestety",
            "Kupon który wprowadziłeś finalnie nie został znaleziony. Jezeli myslisz ze to problem po naszej stronie- skontaktuj się z nami!"
          );
        } else if (data.order == "createdCoupon") {
          document.querySelector("#hotpayIdZamowienia").value = data.orderId;
          document.querySelector("#hotpayKwota").value = data.nowaKwota;
          document.querySelector("#order").submit();
        } else if (data.order == "couponNotForThisProduct") {
          document.querySelector(".offer").classList.remove("untouchable");
          newAlert(
            `UWAGA!`,
            `Podany kupon nie jest przeznaczony dla produktu który chcesz kupić. <b>Wybierz inny produkt</b>`
          );
        }
      }
    }
  });

document
  .querySelector(".sendFormContact")
  .addEventListener("click", async () => {
    let contact = document.querySelector("#contact").value;
    let subject = document.querySelector("#subject").value;
    let wiadomosc = document.querySelector("#wiadomosc").value;
    if (
      contact.length > 200 ||
      subject.length > 200 ||
      wiadomosc.length > 1500 ||
      contact.length < 6 ||
      subject.length < 10 ||
      wiadomosc.length < 15
    ) {
      newAlert(
        "Wypełnij formularz poprawnie",
        "Formularz zawiera za mało lub za duzo znaków!"
      );
    } else {
      let object = {
        action: "nowaWiadomosc",
        contact,
        subject,
        wiadomosc,
      };
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(object),
      };
      const response = await fetch("/nowaWiadomosc", options);
      const data = await response.json();
      console.log(data);
      if (data.action == "done") {
        document.querySelector("#contact").value = "";
        subject = document.querySelector("#subject").value = "";
        wiadomosc = document.querySelector("#wiadomosc").value = "";
        newAlert(
          "Dziękujemy!",
          `Otrzymaliśmy właśnie Twój formularz. Zapraszamy na naszego <a href="https://discord.gg/XS5BTsy3YW" target="_blank" style="color: #9146ff; text-decoration: none; font-weight: 600;">Discorda</a>!`
        );
      } else if (data.action == "tooManyCharacters") {
        newAlert(":)", "Nie kombinuj, nadal za duzo literek");
      }
    }
  });

document.querySelector(".qCopuon > span").addEventListener("click", () => {
  document.querySelector(".qCopuon").style.display = "none";
  document.querySelector(".haveCoupon").style.display = "block";
});

document.querySelector(".couponButton").addEventListener("click", async () => {
  let couponCode = document.querySelector("#couponCode").value;
  if (couponCode == "") {
    document.querySelector("#couponCode").classList.add("pleaseFillMe");
    setTimeout(() => {
      document.querySelector("#couponCode").classList.remove("pleaseFillMe");
    }, 500);
  } else {
    let object = {
      couponCode,
      productId,
    };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(object),
    };
    const response = await fetch("/checkCoupon", options);
    const data = await response.json();
    console.log(data);
    if (data.status == "couponAvailable") {
      newAlert(
        `Kupon został dodany!`,
        `Kupon na ${data.couponDiscount}% został dodany do Twojego zamówienia.`
      );
      let staraCena = document.querySelector(".priceBox").innerHTML;
      let znizka = priceForServiceINT * (data.couponDiscount / 100);
      console.log("znizka " + znizka);
      let nowaCena = priceForServiceINT - znizka;
      nowaCena = nowaCena.toFixed(2);
      document.querySelector(
        ".priceBox"
      ).innerHTML = `<s style="color: rgb(191, 191, 191)">${staraCena}</s> <b>${nowaCena} PLN!</b>`;
      document.querySelector("#couponCodeSpan").innerHTML = couponCode;
      document.querySelector(
        "#couponDiscount"
      ).innerHTML = `${data.couponDiscount}%`;
      document.querySelector(".couponApplied").style.display = "block";
      document.querySelector(".haveCoupon").style.display = "none";
      couponCodeForOrder = couponCode;
    } else if (data.status == "couponUnavailable") {
      newAlert(
        `Kupon niedostępny.`,
        `Podany kupon stracił wazność lub został juz wykorzystany.`
      );
    } else if (data.status == "couponNotfound") {
      newAlert(
        `Nie znaleziono takiego kuponu.`,
        `Podany kupon nie został znaleziony w naszej bazie.`
      );
    } else if (data.status == "couponNotForThisProduct") {
      newAlert(
        `UWAGA!`,
        `Podany kupon nie jest przeznaczony dla produktu który chcesz kupić. <b>Wybierz inny produkt</b>`
      );
    }
  }
});

let prevScrollPos = window.pageYOffset;
document.addEventListener("scroll", (e) => {
  let currentScrollPos = window.pageYOffset;
  if (prevScrollPos > currentScrollPos) {
    document.querySelector(".us").style.transform = "translateY(0)";
  } else {
    document.querySelector(".us").style.transform = "translateY(-100%)";
  }
  prevScrollPos = currentScrollPos;
});

let siema = async () => {
  let object = {
    hej: "siema",
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(object),
  };
  const response = await fetch("/ocenki", options);
  const data = await response.json();
  let checker = 0;
  document.querySelectorAll(".reviewUser").forEach((e) => {
    e.textContent = data[checker].user;
    checker++;
  });
  checker = 0;
  document.querySelectorAll(".reviewDesc").forEach((e) => {
    e.textContent = data[checker].opinia;
    checker++;
  });
  checker = 0;
  document.querySelectorAll(".reviewStars").forEach((e) => {
    e.textContent = `${data[checker].gwiazdki}/5⭐️`;
    checker++;
  });
};

siema();

var Tawk_API = Tawk_API || {},
  Tawk_LoadStart = new Date();
(function () {
  var s1 = document.createElement("script"),
    s0 = document.getElementsByTagName("script")[0];
  s1.async = true;
  s1.src = "https://embed.tawk.to/61b8f927c82c976b71c16f3b/1fmt8qhft";
  s1.charset = "UTF-8";
  s1.setAttribute("crossorigin", "*");
  s0.parentNode.insertBefore(s1, s0);
})();
