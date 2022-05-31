document.querySelector('#createCouponButton').addEventListener('click', async () => {
    let checkerCoupon = 0;
    let products = [];
    document.querySelectorAll(".selectCuponForProductInput").forEach(e => {
        if (e.checked) {
            products.push(parseInt(e.dataset.product))
        }
    });
    console.log(products);
    document.querySelectorAll('.credentialsCoupon').forEach( e => {
        if (e.value != "") {
            checkerCoupon++
        }
    })
    if (checkerCoupon == 3) {
        let couponCode = document.querySelector("#newCouponCode").value;
        let newCouponDiscount = parseInt(document.querySelector("#newCouponDiscount").value);
        let newCouponUsesCount = parseInt(document.querySelector("#newCouponUsesCount").value);
        let object = {
            request: 'newCoupon',
            couponCode,
            newCouponDiscount,
            newCouponUsesCount,
            products
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
        if (data.status == "done") {
            newAlert("Kupon dodany pomyslnie","spoko? (odswiez strone zeby zobaczyc nowy kupon)");
            document.querySelector("#createCoupon").style.display = "none";
        } else {
            newAlert("cos sie zjebalo","nie spoko kontakt IKE KIPPO ERNESTE");
        }
    } else {
        newAlert("uzupelnij wszystkie pola poprawnie", "bo nie sa uzupelnione czy cos.")
    }
    console.log(products);
})

document.querySelector(".mainMenuButton").addEventListener("click", () => {
    document.querySelector("#createCoupon").style.display = "grid"
})