// ================= CAMPAIGN SEARCH & FILTER =================

const searchInput = document.getElementById("campaignSearch");
const campaignItems = document.querySelectorAll(".campaign-item");
const categoryButtons = document.querySelectorAll(".category-btn");
const noResults = document.getElementById("noResults");

function filterCampaigns() {

    if (!searchInput || campaignItems.length === 0) {
        return;
    }

    const searchText = searchInput.value.toLowerCase().trim();

    const activeButton = document.querySelector(".category-btn.active");

    const selectedCategory = activeButton
        ? activeButton.getAttribute("data-category")
        : "all";

    let visibleCount = 0;

    campaignItems.forEach(function (item) {

        const titleElement = item.querySelector("h5");
        const descriptionElement = item.querySelector("p");

        const title = titleElement
            ? titleElement.textContent.toLowerCase()
            : "";

        const description = descriptionElement
            ? descriptionElement.textContent.toLowerCase()
            : "";

        const category = item.getAttribute("data-category");

        const matchesSearch =
            title.includes(searchText) ||
            description.includes(searchText);

        const matchesCategory =
            selectedCategory === "all" ||
            category === selectedCategory;

        if (matchesSearch && matchesCategory) {
            item.classList.remove("d-none");
            visibleCount++;
        } else {
            item.classList.add("d-none");
        }

    });

    if (noResults) {

        if (visibleCount === 0) {
            noResults.classList.remove("d-none");
        } else {
            noResults.classList.add("d-none");
        }

    }
}


// Search

if (searchInput) {

    searchInput.addEventListener("input", function () {
        filterCampaigns();
    });

}


// Category buttons

if (categoryButtons.length > 0) {

    categoryButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            categoryButtons.forEach(function (btn) {

                btn.classList.remove("active");
                btn.classList.remove("btn-primary");
                btn.classList.add("btn-outline-primary");

            });

            this.classList.add("active");
            this.classList.remove("btn-outline-primary");
            this.classList.add("btn-primary");

            filterCampaigns();

        });

    });

}


// ================= DONATION AMOUNT BUTTONS =================

const donationAmountInput =
    document.getElementById("donationAmount");

const amountButtons =
    document.querySelectorAll(".amount-btn");

if (amountButtons.length > 0 && donationAmountInput) {

    amountButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const amount =
                this.getAttribute("data-amount");

            donationAmountInput.value = amount;

            amountButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            this.classList.add("active");

        });

    });

}


// ================= SELECTED CAMPAIGN =================

const donateLinks = document.querySelectorAll(
    '.campaign-item a[href="donate.html"]'
);

donateLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        const campaignCard =
            link.closest(".campaign-item");

        if (!campaignCard) return;

        const titleElement =
            campaignCard.querySelector("h4");

        const categoryElement =
            campaignCard.querySelector(".real-badge");

        const title = titleElement
            ? titleElement.textContent.trim()
            : "KindFund Campaign";

        const category = categoryElement
            ? categoryElement.textContent.trim()
            : "Campaign";

        link.href =
            "donate.html?campaign=" +
            encodeURIComponent(title) +
            "&category=" +
            encodeURIComponent(category);

    });

});


// Show selected campaign

const urlParams =
    new URLSearchParams(window.location.search);

const selectedCampaign =
    urlParams.get("campaign");

const selectedCategory =
    urlParams.get("category");

const campaignTitle =
    document.getElementById("selectedCampaignTitle");

const campaignCategory =
    document.getElementById("selectedCampaignCategory");

if (campaignTitle && selectedCampaign) {
    campaignTitle.textContent = selectedCampaign;
}

if (campaignCategory && selectedCategory) {
    campaignCategory.textContent = selectedCategory;
}


// ================= DONATION FORM =================

const donationForm =
    document.getElementById("donationForm");

if (donationForm) {

    donationForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const donationAmount =
            document.getElementById("donationAmount");

        const paymentMethod =
            document.getElementById("paymentMethod");

        const amount = donationAmount
            ? Number(donationAmount.value)
            : 0;

        if (amount <= 0) {

            alert("Please enter a valid donation amount.");
            return;

        }

        if (!paymentMethod || paymentMethod.value === "") {

            alert("Please select a payment method.");
            return;

        }

        const urlParams =
            new URLSearchParams(window.location.search);

        const campaignName =
            urlParams.get("campaign") ||
            "KindFund Campaign";

        const category =
            urlParams.get("category") ||
            "General";


        // Logged-in user

        const storedUser =
            localStorage.getItem("kindfundUser");

        if (!storedUser) {

            alert("Please login before making a donation.");

            window.location.href = "login.html";

            return;

        }

        const user =
            JSON.parse(storedUser);


        try {

            const response = await fetch(
                "http://localhost:8080/api/donations",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        donorEmail: user.email,

                        campaignName: campaignName,

                        category: category,

                        amount: amount,

                        paymentMethod:
                            paymentMethod.value,

                        status: "SUCCESSFUL"

                    })
                }
            );


            const responseText =
                await response.text();

            console.log(
                "Donation response:",
                responseText
            );


            if (!response.ok) {

                alert(
                    "Donation failed: " +
                    responseText
                );

                return;

            }


            alert(
                "Donation successful! Thank you for supporting this cause ❤️"
            );


            window.location.href =
                "dashboard.html";


        } catch (error) {

            console.error(
                "Donation Error:",
                error
            );

            alert(
                "Unable to connect to KindFund server."
            );

        }

    });

}


// ================= LOGIN =================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const emailInput =
            loginForm.querySelector(
                'input[type="email"]'
            );

        const passwordInput =
            loginForm.querySelector(
                'input[type="password"]'
            );

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (email === "" || password === "") {

            alert(
                "Please enter email and password."
            );

            return;

        }


        try {

            const response = await fetch(
                "http://localhost:8080/api/users/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const responseText =
                await response.text();


            console.log(
                "Login response:",
                responseText
            );


            if (!response.ok) {

                alert(
                    "Login failed: " +
                    responseText
                );

                return;

            }


            const result =
                JSON.parse(responseText);


            localStorage.setItem(
                "kindfundLoggedIn",
                "true"
            );


            localStorage.setItem(
                "kindfundUser",
                JSON.stringify(result)
            );


            alert(
                "Login successful! Welcome to KindFund ❤️"
            );


            window.location.href =
                "dashboard.html";


        } catch (error) {

            console.error(
                "Login Error:",
                error
            );

            alert(
                "Login request failed. Check browser Console for details."
            );

        }

    });

}


// ================= REGISTER =================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const inputs =
            registerForm.querySelectorAll("input");

        const fullName =
            inputs[0].value.trim();

        const email =
            inputs[1].value.trim();

        const phone =
            inputs[2].value.trim();

        const password =
            inputs[3].value;

        const confirmPassword =
            inputs[4].value;


        if (!/^\d{10}$/.test(phone)) {

            alert(
                "Phone number must be exactly 10 digits."
            );

            return;

        }


        if (password.length < 6) {

            alert(
                "Password must be at least 6 characters."
            );

            return;

        }


        if (password !== confirmPassword) {

            alert(
                "Passwords do not match."
            );

            return;

        }


        try {

            const response = await fetch(
                "http://localhost:8080/api/users/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        fullName: fullName,

                        email: email,

                        phone: phone,

                        password: password,

                        role: "DONOR"

                    })
                }
            );


            const result =
                await response.text();


            if (!response.ok) {

                alert(result);

                return;

            }


            alert(
                "Account created successfully! ❤️"
            );


            window.location.href =
                "login.html";


        } catch (error) {

            console.error(
                "Register Error:",
                error
            );

            alert(
                "Unable to connect to KindFund server. Please make sure Spring Boot is running."
            );

        }

    });

}