const Discord = require("discord.js");
const TanieSubyBot = new Discord.Client();
const disbut = require("discord-buttons")(TanieSubyBot);
const { MessageButton, MessageActionRow } = require("discord-buttons");
const bodyParser = require("body-parser");
const express = require("express");
const fs = require("fs");
const app = express();
const httpApp = express();
const http = require("http");
const https = require("https");
const session = require("express-session");
const path = require("path");
const force = require("express-force-domain");

const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/taniesuby.eu/privkey.pem",
  "utf8"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/taniesuby.eu/cert.pem",
  "utf8"
);
const ca = fs.readFileSync(
  "/etc/letsencrypt/live/taniesuby.eu/chain.pem",
  "utf8"
);

const letters = "qwertyuiopasdfghjklzxcvbnm";
const numbers = "1234567890";

let generateId = (length) => {
  let temp = "";
  for (let x = 0; x < length / 2; x++) {
    if (x % 2 == 0 && x != 0) {
      temp += "-";
    }
    temp += letters[Math.floor(Math.random() * letters.length)];
    temp += numbers[Math.floor(Math.random() * numbers.length)];
  }
  return temp;
};

let realizuj = new MessageButton()
  .setStyle("green")
  .setLabel("Zrealizowano")
  .setEmoji("✅")
  .setID("zrealizowano");
let odrzuc = new MessageButton()
  .setStyle("red")
  .setLabel("Odrzuc")
  .setEmoji("❌")
  .setID("declined");
let buttons = new MessageActionRow()
  .addComponent(realizuj)
  .addComponent(odrzuc);

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

httpApp.set("port", 80);
httpApp.get("*", function (req, res, next) {
  res.redirect("https://" + req.headers.host + req.path);
});

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 10,
    },
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(force("https://ike-gg.github.io/tanieSuby"));

app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));

const httpServer = http.createServer(httpApp);
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(443, () => {
  console.log("HTTPS Server running on port 443");
});

httpServer.listen(80, () => {
  console.log("HTTP Server running on port 80");
});

app.post("/auth", (req, res) => {
  let login = req.body.login;
  let password = req.body.password;
  let users = JSON.parse(fs.readFileSync("orders/users.json"));
  let indexOfUser = users.findIndex((e) => e.login == login);
  if (indexOfUser != -1) {
    if (users[indexOfUser].password == password) {
      req.session.loggedin = true;
      req.session.login = login;
      res.json({
        status: "loggedin",
      });
    } else {
      res.json({
        status: "incorrect",
      });
    }
  } else {
    res.json({
      status: "incorrect",
    });
  }
});

app.get("/adminPanel", (req, res) => {
  if (req.session.loggedin) {
    res.sendFile(path.join(__dirname + "/adminPanel/index.html"));
  } else {
    res.redirect("https://ike-gg.github.io/tanieSuby/admin");
  }
});

app.post("/adminPanel", (req, res) => {
  if (req.session.loggedin) {
    if (req.body.request == "getData") {
      let warehouse = JSON.parse(fs.readFileSync("orders/orders.json"));
      let warehouseCoupons = JSON.parse(fs.readFileSync("orders/coupons.json"));
      res.json({
        username: req.session.login,
        orders: warehouse,
        coupons: warehouseCoupons,
      });
    } else if (req.body.request == "logout") {
      req.session.loggedin = false;
      res.json({
        status: "loggedout",
      });
    } else if (req.body.request == "newCoupon") {
      let warehouseCoupons = JSON.parse(fs.readFileSync("orders/coupons.json"));
      let newCoupon = {
        couponCode: req.body.couponCode,
        couponDiscount: req.body.newCouponDiscount,
        couponUsesLeft: req.body.newCouponUsesCount,
        forProducts: req.body.products,
      };
      console.log(`dodano nowy kupon: ${newCoupon}`);
      warehouseCoupons.coupons.push(newCoupon);
      fs.writeFileSync("orders/coupons.json", JSON.stringify(warehouseCoupons));
      res.json({
        status: "done",
      });
    }
  } else {
    res.redirect("https://ike-gg.github.io/tanieSuby/admin");
  }
});

// let warehouse = JSON.parse(fs.readFileSync('orders/orders.json'));
// fs.writeFileSync('orders/orders.json', JSON.stringify(warehouse));

app.post("/noweZamowienieHotPay", (req, res) => {
  // TanieSubyBot.channels.cache.get('878848139405176853').send(JSON.stringify(req.body));
  console.log(req.body);
  let warehouse = JSON.parse(fs.readFileSync("orders/orders.json"));
  let orderId = generateId(16);
  let nowyOrder = {
    metodaPlatnosci: req.body.metodaPlatnosci,
    data: new Date(),
    orderId,
    idPlatnosci: null,
    productId: req.body.productId,
    kwota: req.body.kwota,
    produkt: req.body.produkt,
    nickTwitch: req.body.nickTwitch,
    channelTwitch: req.body.channelTwitch,
    discordTag: req.body.discordTag,
    clientMail: req.body.clientMail,
    zaplacone: false,
    zrealizowane: false,
    opinia: null,
    gwiazdki: null,
    couponCode: null,
    couponDiscount: null,
  };
  if (req.body.couponCodeForOrder != null) {
    let warehouseCoupons = JSON.parse(fs.readFileSync("orders/coupons.json"));
    let indexOfCoupon = warehouseCoupons.coupons.findIndex(
      (e) => e.couponCode == req.body.couponCodeForOrder
    );
    if (indexOfCoupon != -1) {
      if (warehouseCoupons.coupons[indexOfCoupon].couponUsesLeft != 0) {
        if (
          warehouseCoupons.coupons[indexOfCoupon].forProducts.includes(
            req.body.productId
          )
        ) {
          nowyOrder.couponCode = req.body.couponCodeForOrder;
          nowyOrder.couponDiscount =
            warehouseCoupons.coupons[indexOfCoupon].couponDiscount;
          warehouseCoupons.coupons[indexOfCoupon].couponUsesLeft--;
        } else {
          res.json({
            order: "couponNotForThisProduct",
          });
          return 0;
        }
      } else {
        res.json({
          order: "couponExpired",
        });
        return 0;
      }
    } else {
      res.json({
        order: "couponnotfound",
      });
      return 0;
    }
    fs.writeFileSync("orders/coupons.json", JSON.stringify(warehouseCoupons));
  }
  warehouse.orders.push(nowyOrder);
  if (nowyOrder.couponCode == null && nowyOrder.couponDiscount == null) {
    res.json({
      order: "created",
      orderId,
    });
  } else {
    let roznica = nowyOrder.kwota * (nowyOrder.couponDiscount / 100);
    let nowaKwota = nowyOrder.kwota - roznica;
    res.json({
      order: "createdCoupon",
      orderId,
      nowaKwota,
    });
  }

  fs.writeFileSync("orders/orders.json", JSON.stringify(warehouse));
  TanieSubyBot.channels.cache.get("878848139405176853").send(``, {
    embed: {
      color: 0xba8cff,
      title: `Nowe zamówienie: ${nowyOrder.produkt} PRODUKT O ID: ${nowyOrder.productId}`,
      description: `Zamówienie zostało dopiero stworzone, nie oznacza ze zostało opłacone!`,
      author: {
        name: `discord tag: ${nowyOrder.discordTag}, email: ${nowyOrder.clientMail}`,
      },
      fields: [
        {
          name: `Nick twitch.tv`,
          value: `${nowyOrder.nickTwitch}`,
          inline: true,
        },
        {
          name: `Kanał na którym chce gifta:`,
          value: `${nowyOrder.channelTwitch}`,
          inline: true,
        },
        {
          name: `Metoda płatności: ${nowyOrder.metodaPlatnosci}`,
          value: `Kwota: ${nowyOrder.kwota} PLN`,
          inline: true,
        },
        {
          name: `Uzyty kupon: ${nowyOrder.couponCode}`,
          value: `Na: ${nowyOrder.couponDiscount}%`,
          inline: true,
        },
      ],
      footer: {
        text: `${nowyOrder.orderId}`,
      },
    },
  });
});

app.post("/hotpay", (req, res) => {
  // TanieSubyBot.channels.cache.get('878835811070644264').send(JSON.stringify(req.body));
  console.log(req.body);
  let warehouse = JSON.parse(fs.readFileSync("orders/orders.json"));
  let indexOfOrder = warehouse.orders.findIndex(
    (e) => e.orderId == req.body.ID_ZAMOWIENIA
  );
  if (indexOfOrder != -1) {
    if (req.body.STATUS == "SUCCESS") {
      warehouse.orders[indexOfOrder].kwota = req.body.KWOTA;
      warehouse.orders[indexOfOrder].idPlatnosci = req.body.ID_PLATNOSCI;
      warehouse.orders[indexOfOrder].zaplacone = true;
      TanieSubyBot.channels.cache.get("878835811070644264").send(``, {
        embed: {
          color: 0x00cc55,
          title: `ZAMÓWIENIE DO REALIZACJI!: ${warehouse.orders[indexOfOrder].produkt} PRODUKT ID: ${warehouse.orders[indexOfOrder].productId}`,
          description: `Zamówienie został opłacone. Mozna je realizować!`,
          author: {
            name: `discord tag: ${warehouse.orders[indexOfOrder].discordTag}, email: ${warehouse.orders[indexOfOrder].clientMail}`,
          },
          fields: [
            {
              name: `Nick twitch.tv`,
              value: `${warehouse.orders[indexOfOrder].nickTwitch}`,
              inline: true,
            },
            {
              name: `Kanał na którym chce gifta:`,
              value: `${warehouse.orders[indexOfOrder].channelTwitch}`,
              inline: true,
            },
            {
              name: `Metoda płatności: ${warehouse.orders[indexOfOrder].metodaPlatnosci}`,
              value: `Kwota: ${warehouse.orders[indexOfOrder].kwota} PLN`,
              inline: true,
            },
            {
              name: `Uzyl kuponu: ${warehouse.orders[indexOfOrder].couponCode}`,
              value: `Na: ${warehouse.orders[indexOfOrder].couponDiscount}%`,
              inline: true,
            },
          ],
          footer: {
            text: `${warehouse.orders[indexOfOrder].orderId}`,
          },
        },
        components: buttons,
      });
    }
  } else {
    if (req.body.status == "SUCCESS") {
      TanieSubyBot.channels.cache.get("878835811070644264").send(``, {
        embed: {
          color: 0x00cc55,
          title: `COŚ DZIWNEGO, NIE ZNALEZIONO TAKIEGO ZAMÓWIENIA W SYSTEMIE ALE PŁATNOŚĆ PRZESZŁA. TRZEBA TO SPRAWDZIĆ. (SYTUACJA BARDZO RZADKA)`,
          description: `sprawdź to w panelu hotpay`,
          fields: [
            {
              name: `Kwota:`,
              value: `${req.body.KWOTA}`,
              inline: true,
            },
            {
              name: `ID PLATNOSCI: ${req.body.ID_PLATNOSCI}`,
              value: `ID ZAMOWIENIA: ${req.body.ID_ZAMOWIENIA}`,
              inline: true,
            },
          ],
          footer: {
            text: `${req.body.ID_ZAMOWIENIA}`,
          },
        },
        components: buttons,
      });
    }
  }
  fs.writeFileSync("orders/orders.json", JSON.stringify(warehouse));
  res.sendStatus(200);
});

app.post("/ocenki", (req, res) => {
  let warehouse = JSON.parse(fs.readFileSync("orders/orders.json"));
  let obiekt = [];
  for (let x = 0; x < 4; x++) {
    let temporary = Math.floor(Math.random() * warehouse.orders.length);
    do {
      temporary = Math.floor(Math.random() * warehouse.orders.length);
    } while (warehouse.orders[temporary].opinia == null);
    obiekt.push({
      user: warehouse.orders[temporary].nickTwitch,
      opinia: warehouse.orders[temporary].opinia,
      gwiazdki: warehouse.orders[temporary].gwiazdki,
    });
  }
  res.json(obiekt);
});

app.post("/nowaWiadomosc", (request, res) => {
  if (request.body.action == "nowaWiadomosc") {
    if (
      request.body.contact.length > 200 ||
      request.body.subject.length > 200 ||
      request.body.wiadomosc.length > 1500
    ) {
      res.json({
        action: "tooManyCharacters",
      });
    } else {
      TanieSubyBot.channels.cache.get("879111647699038260").send(``, {
        embed: {
          color: 0xffffff,
          title: `Nowa wiadomość ze strony`,
          author: {
            name: `Kontakt do osoby: ${request.body.contact}`,
          },
          description: `**${request.body.subject}**\nTreść: ${request.body.wiadomosc}`,
          footer: {
            text: "via kontakt formularz",
          },
        },
      });
      res.json({
        action: "done",
      });
    }
  }
});

app.post("/webhook", (req, res) => {
  //ZAMOWIENIE STWORZONE
  console.log(req.body.event);

  if (req.body.event == "order:created") {
    let warehouse = JSON.parse(fs.readFileSync("orders/orders.json"));
    let orderId = generateId(16);
    let customFields = Object.values(req.body.data.custom_fields);
    let nowyOrder = {
      metodaPlatnosci: "sellix",
      orderId,
      idPlatnosci: req.body.data.uniqid,
      data: new Date(),
      kwota: req.body.data.total_display,
      produkt: req.body.data.product_title,
      nickTwitch: customFields[0],
      channelTwitch: customFields[1],
      discordTag: customFields[2],
      clientMail: req.body.data.customer_email,
      zaplacone: false,
      zrealizowane: false,
      opinia: null,
      gwiazdki: null,
      couponCode: req.body.data.coupon_code,
      couponDiscount: "sellix nie podaje ile % trza samemu sprawdzic",
    };
    warehouse.orders.push(nowyOrder);
    TanieSubyBot.channels.cache.get("878848139405176853").send(``, {
      embed: {
        color: 0xba8cff,
        title: `Nowe zamówienie: ${nowyOrder.produkt} PRODUKT O ID: ${nowyOrder.productId}`,
        url: `https://sellix.io/product/${req.body.data.product_id}`,
        description: `Zamówienie zostało dopiero stworzone, nie oznacza ze zostało opłacone!`,
        fields: [
          {
            name: `Nick twitch.tv`,
            value: `${nowyOrder.nickTwitch}`,
            inline: true,
          },
          {
            name: `Kanał na którym chce gifta:`,
            value: `${nowyOrder.channelTwitch}`,
            inline: true,
          },
          {
            name: `Metoda płatności: ${nowyOrder.metodaPlatnosci}`,
            value: `Kwota: ${nowyOrder.kwota} PLN`,
            inline: true,
          },
          {
            name: `Uzyty kupon: ${nowyOrder.couponCode}`,
            value: `Na: ${nowyOrder.couponDiscount}%`,
            inline: true,
          },
        ],
        footer: {
          text: `${nowyOrder.orderId}`,
        },
      },
    });
    fs.writeFileSync("orders/orders.json", JSON.stringify(warehouse));
    res.sendStatus(200);
  }

  //ZAMOWIENIE OPLACONE
  else if (req.body.event == "order:paid") {
    let warehouse = JSON.parse(fs.readFileSync("orders/orders.json"));
    let indexOfOrder = warehouse.orders.findIndex(
      (e) => e.idPlatnosci == req.body.data.uniqid
    );
    if (indexOfOrder != -1) {
      warehouse.orders[indexOfOrder].kwota = req.body.data.total_display;
      warehouse.orders[indexOfOrder].zaplacone = true;
      TanieSubyBot.channels.cache.get("878835811070644264").send(``, {
        embed: {
          color: 0x00cc55,
          title: `ZAMÓWIENIE DO REALIZACJI!: ${warehouse.orders[indexOfOrder].produkt} PRODUKT O ID: ${warehouse.orders[indexOfOrder].productId}`,
          description: `Zamówienie został opłacone. Mozna je realizować!`,
          author: {
            name: `discord tag: ${warehouse.orders[indexOfOrder].discordTag}, email: ${warehouse.orders[indexOfOrder].clientMail}`,
          },
          fields: [
            {
              name: `Nick twitch.tv`,
              value: `${warehouse.orders[indexOfOrder].nickTwitch}`,
              inline: true,
            },
            {
              name: `Kanał na którym chce gifta:`,
              value: `${warehouse.orders[indexOfOrder].channelTwitch}`,
              inline: true,
            },
            {
              name: `Metoda płatności: ${warehouse.orders[indexOfOrder].metodaPlatnosci}`,
              value: `Kwota: ${warehouse.orders[indexOfOrder].kwota} PLN`,
              inline: true,
            },
            {
              name: `Uzyty kupon: ${warehouse.orders[indexOfOrder].couponCode}`,
              value: `Na: ${warehouse.orders[indexOfOrder].couponDiscount}%`,
              inline: true,
            },
          ],
          footer: {
            text: `${warehouse.orders[indexOfOrder].orderId}`,
          },
        },
        components: buttons,
      });
      fs.writeFileSync("orders/orders.json", JSON.stringify(warehouse));
    } else {
      TanieSubyBot.channels.cache.get("878835811070644264").send(``, {
        embed: {
          color: 0x00cc55,
          title: `COŚ DZIWNEGO, NIE ZNALEZIONO TAKIEGO ZAMÓWIENIA W SYSTEMIE ALE PŁATNOŚĆ PRZESZŁA. TRZEBA TO SPRAWDZIĆ. (SYTUACJA BARDZO RZADKA)`,
          description: `sprawdź to w panelu hotpay i w panelu admina jezeli go napisalem :D`,
          fields: [
            {
              name: `Kwota: ${req.body.data.total_display}`,
              value: `Przez sellix'a. Sprawdź po numerze zamówienia.`,
              inline: true,
            },
            {
              name: `ID PLATNOSCI: ${req.body.data.uniqid}`,
              value: `Email kupujacego: ${req.body.data.customer_email}`,
              inline: true,
            },
          ],
          footer: {
            text: `${req.body.data.uniqid}`,
          },
        },
        components: buttons,
      });
    }
    res.sendStatus(200);
  }

  //NOWY FEEDBACK SELLIX
  else if (req.body.event == "feedback:received") {
    let warehouse = JSON.parse(fs.readFileSync("orders/orders.json"));
    let indexOfOrder = warehouse.orders.findIndex(
      (e) => e.idPlatnosci == req.body.data.invoice.uniqid
    );
    if (indexOfOrder != -1) {
      warehouse.orders[indexOfOrder].opinia = req.body.data.message;
      warehouse.orders[indexOfOrder].gwiazdki = req.body.data.score;
      let gwiazdki = "";
      for (let x = 0; x < warehouse.orders[indexOfOrder].gwiazdki; x++) {
        gwiazdki += "⭐️";
      }
      TanieSubyBot.channels.cache.get("879875957689839666").send({
        embed: {
          color: 0xba8cff,
          author: {
            name: `${gwiazdki} ${warehouse.orders[indexOfOrder].nickTwitch}`,
          },
          title: `Feedback produktu ${warehouse.orders[indexOfOrder].produkt}`,
          description: `Opinia: ${warehouse.orders[indexOfOrder].opinia}`,
          footer: {
            text: `${warehouse.orders[indexOfOrder].orderId}`,
          },
        },
      });
      fs.writeFileSync("orders/orders.json", JSON.stringify(warehouse));
      res.sendStatus(200);
    }
  } else {
    res.sendStatus(404);
  }
});

app.post("/feedback", (req, res) => {
  let warehouse = JSON.parse(fs.readFileSync("orders/orders.json"));
  let indexOfOrder = warehouse.orders.findIndex(
    (e) => e.orderId == req.body.orderId
  );
  if (indexOfOrder != -1) {
    if (
      warehouse.orders[indexOfOrder].zaplacone == true &&
      warehouse.orders[indexOfOrder].zrealizowane == true
    ) {
      if (
        warehouse.orders[indexOfOrder].opinia == null &&
        warehouse.orders[indexOfOrder].gwiazdki == null
      ) {
        res.json({
          status: `waitingForFeedback`,
          order: warehouse.orders[indexOfOrder],
        });
      } else {
        res.json({
          status: `feedbackAlredyExists`,
          message: `Opinia do tego zamówienia juz istnieje!`,
        });
      }
    } else {
      res.json({
        status: `lookingForward`,
        message: `Zamówienie nie zostało jeszcze opłacone lub zrealizowane.`,
      });
    }
  } else {
    res.json({
      status: `orderDoesntExists`,
      message: `Takie zamówienie nie istnieje.`,
    });
  }
});

app.post("/nowyFeedback", (req, res) => {
  let warehouse = JSON.parse(fs.readFileSync("orders/orders.json"));
  let indexOfOrder = warehouse.orders.findIndex(
    (e) => e.orderId == req.body.orderId
  );
  if (indexOfOrder != -1) {
    if (
      warehouse.orders[indexOfOrder].opinia == null &&
      warehouse.orders[indexOfOrder].gwiazdki == null
    ) {
      warehouse.orders[indexOfOrder].opinia = req.body.feedbackText;
      warehouse.orders[indexOfOrder].gwiazdki = req.body.stars;
      let gwiazdki = "";
      for (let x = 0; x < warehouse.orders[indexOfOrder].gwiazdki; x++) {
        gwiazdki += "⭐️";
      }
      TanieSubyBot.channels.cache.get("879875957689839666").send({
        embed: {
          color: 0xba8cff,
          author: {
            name: `${gwiazdki} ${warehouse.orders[indexOfOrder].nickTwitch}`,
          },
          title: `Feedback produktu ${warehouse.orders[indexOfOrder].produkt}`,
          description: `Opinia: ${warehouse.orders[indexOfOrder].opinia}`,
          footer: {
            text: `${warehouse.orders[indexOfOrder].orderId}`,
          },
        },
      });
      fs.writeFileSync("orders/orders.json", JSON.stringify(warehouse));
      res.json({
        status: "approved",
      });
    }
  }
});

app.post("/checkCoupon", (req, res) => {
  let warehouse = JSON.parse(fs.readFileSync("orders/coupons.json"));
  let indexOfCoupon = warehouse.coupons.findIndex(
    (e) => e.couponCode == req.body.couponCode
  );
  if (indexOfCoupon != -1) {
    if (warehouse.coupons[indexOfCoupon].couponUsesLeft > 0) {
      if (
        warehouse.coupons[indexOfCoupon].forProducts.includes(
          req.body.productId
        )
      ) {
        res.json({
          status: "couponAvailable",
          couponDiscount: warehouse.coupons[indexOfCoupon].couponDiscount,
        });
      } else {
        res.json({
          status: "couponNotForThisProduct",
        });
      }
    } else {
      res.json({
        status: "couponUnavailable",
      });
    }
  } else {
    res.json({
      status: "couponNotfound",
    });
  }
});

TanieSubyBot.on("clickButton", async (button) => {
  button.reply.defer();
  if (button.id == "zrealizowano") {
    let warehouse = JSON.parse(fs.readFileSync("orders/orders.json"));
    console.log(button.message.embeds[0].footer.text);
    let indexOfOrder = warehouse.orders.findIndex(
      (e) => e.orderId == button.message.embeds[0].footer.text
    );
    if (indexOfOrder != -1) {
      warehouse.orders[indexOfOrder].zrealizowane = true;
      TanieSubyBot.channels.cache.get("878835934576115772").send({
        embed: {
          color: 0x00cc55,
          description: "Zamówienie zrealizowane!",
          title: `Zamówienie zrealizowane ${warehouse.orders[indexOfOrder].produkt}`,
          fields: [
            {
              name: `Nick twitch.tv`,
              value: `${warehouse.orders[indexOfOrder].nickTwitch}`,
              inline: true,
            },
            {
              name: `Kanał na którym chce gifta:`,
              value: `${warehouse.orders[indexOfOrder].channelTwitch}`,
              inline: true,
            },
            {
              name: `Metoda płatności: ${warehouse.orders[indexOfOrder].metodaPlatnosci}`,
              value: `Kwota: ${warehouse.orders[indexOfOrder].kwota} PLN`,
              inline: true,
            },
          ],
          footer: {
            text: `${warehouse.orders[indexOfOrder].orderId}`,
          },
        },
      });
      button.message.delete();
      fs.writeFileSync("orders/orders.json", JSON.stringify(warehouse));
    } else {
      button.message.reply(
        `1. Cos sie spierdolilo, powiec ernest zeby to sprawdzil, id zamuwienia: ${button.message.embeds[0].footer.text}`
      );
    }
  } else if (button.id == "declined") {
    let warehouse = JSON.parse(fs.readFileSync("orders/orders.json"));
    let indexOfOrder = warehouse.orders.findIndex(
      (e) => e.orderId == button.message.embeds[0].footer.text
    );
    if (indexOfOrder != -1) {
      warehouse.orders[indexOfOrder].zrealizowane = "anulowane";
      TanieSubyBot.channels.cache.get("878835934576115772").send({
        embed: {
          color: 0xed0000,
          description: "Zamówienie anulowane.",
          title: `Zamówienie zostało anulowane ${warehouse.orders[indexOfOrder].produkt}`,
          fields: [
            {
              name: `Nick twitch.tv`,
              value: `${warehouse.orders[indexOfOrder].nickTwitch}`,
              inline: true,
            },
            {
              name: `Kanał na którym chce gifta:`,
              value: `${warehouse.orders[indexOfOrder].channelTwitch}`,
              inline: true,
            },
            {
              name: `Metoda płatności: ${warehouse.orders[indexOfOrder].metodaPlatnosci}`,
              value: `Kwota: ${warehouse.orders[indexOfOrder].kwota} PLN`,
              inline: true,
            },
          ],
          footer: {
            text: `${warehouse.orders[indexOfOrder].orderId}`,
          },
        },
      });
      fs.writeFileSync("orders/orders.json", JSON.stringify(warehouse));
      button.message.delete();
    } else {
      button.message.reply(
        `2. Cos sie spierdolilo, powiec ernest zeby to sprawdzil, id zamuwienia: ${button.message.embeds[0].footer.text}`
      );
    }
  }
});

TanieSubyBot.on("message", (message) => {
  //bulk :D

  if (message.content.startsWith("bulk ")) {
    let temp = message.content.slice(5);
    temp = Number(temp);
    message.channel.bulkDelete(temp);
  }

  if (message.content.startsWith("order ")) {
    let temp = message.content.slice(6);
    let warehouse = JSON.parse(fs.readFileSync("orders/orders.json"));
    let indexOfOrder = warehouse.orders.findIndex((e) => e.orderId == temp);
    if (indexOfOrder != -1) {
      message.delete();
      message.channel
        .send({
          embed: {
            color: 0xba8cff,
            title: `Komenda order zamówienia ${temp}`,
            author: {
              name: message.author.username,
            },
            fields: [
              {
                name: `Metoda platnosci: ${warehouse.orders[indexOfOrder].metodaPlatnosci}`,
                value: `Kwota: ${warehouse.orders[indexOfOrder].kwota}`,
              },
              {
                name: `Order id: ${warehouse.orders[indexOfOrder].orderId}`,
                value: `Id Platnosci (to albo platnosc id w hotpay'u albo id zamowienia w sellixie) ${warehouse.orders[indexOfOrder].idPlatnosci}`,
                inline: true,
              },
              {
                name: `produkt: ${warehouse.orders[indexOfOrder].produkt}`,
                value: `💀`,
                inline: true,
              },
              {
                name: `nick na twitchu klienta ${warehouse.orders[indexOfOrder].nickTwitch}`,
                value: `kanal na ktorym dostal gifta: ${warehouse.orders[indexOfOrder].channelTwitch}`,
              },
              {
                name: `discordTag: ${warehouse.orders[indexOfOrder].discordTag}`,
                value: `email klienta: ${warehouse.orders[indexOfOrder].clientMail}`,
                inline: true,
              },
              {
                name: `zaplacone? ${warehouse.orders[indexOfOrder].zaplacone}`,
                value: `zrealizowane? ${warehouse.orders[indexOfOrder].zrealizowane}`,
                inline: true,
              },
              {
                name: `opinia: ${warehouse.orders[indexOfOrder].opinia}`,
                value: `ile gwiazdek: ${warehouse.orders[indexOfOrder].gwiazdki}`,
              },
              {
                name: `kupon jakis: ${warehouse.orders[indexOfOrder].couponCode}`,
                value: `na ile kupon: ${warehouse.orders[indexOfOrder].couponDiscount}%`,
              },
              {
                name: `produkt ID: ${warehouse.orders[indexOfOrder].productId}`,
                value: `dokladna data zamuwienia: ${warehouse.orders[indexOfOrder].data}`,
              },
            ],
            footer: {
              text: "wiadomosc automatycznie usunie sie po 30 sekundach.",
            },
          },
        })
        .then((e) => {
          e.delete({ timeout: 30000 });
        });
    } else {
      message
        .reply(
          "Nie znalazłem takiego id zamowienia. jezeli jestes pewny ze jest poprawny to sie ze mnom skontaktuj zgoda"
        )
        .then((e) => {
          e.delete({ timeout: 10000 });
        });
    }
  }

  //embed from json

  if (message.content.startsWith("embed ")) {
    if (true) {
      let temp = message.content.slice(6);
      if (fs.existsSync(`./embeds/${temp}.json`)) {
        message.delete();
        let rawData = fs.readFileSync(`./embeds/${temp}.json`);
        let JSONData = JSON.parse(rawData);
        if (message.content.includes("jaktodziala")) {
          message.channel.send({
            embed: JSONData,
            files: [
              "https://ike-gg.github.io/tanieSuby/images/jaktodziala.png",
            ],
          });
        } else if (message.content.includes("tier1")) {
          message.channel.send({
            embed: JSONData,
            files: ["https://ike-gg.github.io/tanieSuby/images/tier1.png"],
          });
        } else if (message.content.includes("tier2")) {
          message.channel.send({
            embed: JSONData,
            files: ["https://ike-gg.github.io/tanieSuby/images/tier2.png"],
          });
        } else if (message.content.includes("tier3")) {
          message.channel.send({
            embed: JSONData,
            files: ["https://ike-gg.github.io/tanieSuby/images/tier3.png"],
          });
        } else {
          message.channel.send({ embed: JSONData });
        }
      } else {
        message.reply("nie istenieje taki embed w ./embeds");
      }
    }
  }

  if (message.content.startsWith("embedPing ")) {
    if (true) {
      let temp = message.content.slice(10);
      if (fs.existsSync(`./embeds/${temp}.json`)) {
        let rawData = fs.readFileSync(`./embeds/${temp}.json`);
        let JSONData = JSON.parse(rawData);
        message.delete();
        message.channel.send("@everyone", { embed: JSONData });
      } else {
        message.reply("nie istenieje taki embed w ./embeds");
      }
    }
  }

  //fee calculator
  if (message.content.startsWith("fee ")) {
    let temp = message.content.slice(4);
    if (temp.includes(",") || temp.includes(".")) {
      if (temp.includes(",")) {
        temp = temp.replace(",", ".");
      } else if (temp.includes(".")) {
        temp = Number(temp);
      }
      let paypalFee = temp * 0.03;
      let paypalFeeC = 1.34;
      let sellixFee = temp * 0.03;
      let finalPrice = temp - paypalFee - paypalFeeC - sellixFee;
      message.channel.send({
        embed: {
          title: `Liczenie fee sellixa i scampala`,
          description: `Wzur to cena oryginalna - 0,3$ - 6%`,
          fields: [
            {
              name: `Fee paypala`,
              value: `${paypalFee}`,
            },
            {
              name: `Fee paypala stałe (0,3$) dane z 24.08`,
              value: `${paypalFeeC}`,
            },
            {
              name: `Sellix fee`,
              value: `${sellixFee}`,
            },
            {
              name: `Ile dostaniesz finalnie przez scampala?`,
              value: `${finalPrice}`,
            },
          ],
          footer: {
            text: `scampal porvalo`,
          },
        },
      });
    } else {
      message.channel.send("kwota nie zawiera przecinka lub kropki");
    }
  }
});

//tutaj umieszczasz token do bota (KOD MUSI BYC W POMIEDZY 'kod').
TanieSubyBot.login("w tym miejscu kod do bota");
