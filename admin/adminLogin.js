document.querySelector("#loginButton").addEventListener("click", async () => {
  let login = document.querySelector("#loginInput").value;
  let password = document.querySelector("#loginPassword").value;
  let object = {
    login,
    password,
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(object),
  };
  const response = await fetch("/auth", options);
  const data = await response.json();
  if (data.status == "loggedin") {
    location.href = "https://ike-gg.github.io/tanieSuby/adminPanel";
  } else newAlert("Błąd", "Podane dane nie zostały znalezione.");
});
