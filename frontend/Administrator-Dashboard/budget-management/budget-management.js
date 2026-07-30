
// Budget Management JavaScript

// Page Load
window.onload = function () {
    console.log("Budget Management Page Loaded");
    animateCards();
};

// Search Budget Table
const searchInput = document.getElementById("searchBudget");

searchInput.addEventListener("keyup", function () {

    const filter = this.value.toLowerCase();

    const rows = document.querySelectorAll("#budgetTable tr");

    rows.forEach(row => {

        const project = row.cells[1].textContent.toLowerCase();
        const status = row.cells[5].textContent.toLowerCase();

        if (
            project.includes(filter) ||
            status.includes(filter)
        ) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }

    });

});

// Table Row Click
const budgetRows = document.querySelectorAll("#budgetTable tr");

budgetRows.forEach(row => {

    row.addEventListener("click", function () {

        const project = this.cells[1].textContent;

        alert("Budget details for " + project);

    });

});

// Highlight Summary Cards
function animateCards() {

    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {

        card.addEventListener("mouseenter", function () {

            this.style.transform = "translateY(-8px)";
            this.style.transition = "0.3s";

        });

        card.addEventListener("mouseleave", function () {

            this.style.transform = "translateY(0px)";

        });

    });

}

// Recent Transactions Click
const transactions = document.querySelectorAll(".transactions tbody tr");

transactions.forEach(row => {

    row.addEventListener("click", function () {

        const project = this.cells[1].textContent;
        const amount = this.cells[3].textContent;

        alert("Transaction\n\nProject: " + project + "\nAmount: " + amount);

    });

});

// Budget Alerts
const alerts = document.querySelectorAll(".summary-card ul li");

alerts.forEach(alertItem => {

    alertItem.addEventListener("click", function () {

        alert(this.textContent);

    });

});

// Sidebar Active Menu
const menuItems = document.querySelectorAll(".sidebar ul li");

menuItems.forEach(item => {

    item.addEventListener("click", function () {

        menuItems.forEach(menu => menu.classList.remove("active"));

        this.classList.add("active");

    });

});

// Logout
function logout() {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (confirmLogout) {

        window.location.href = "../login.html";

    }

}

// Date & Time
const header = document.querySelector("header");

const dateTime = document.createElement("p");

dateTime.style.fontSize = "14px";
dateTime.style.color = "#555";
dateTime.style.marginTop = "8px";

header.appendChild(dateTime);

function updateDateTime() {

    const now = new Date();

    dateTime.textContent = now.toLocaleDateString() +
        " | " +
        now.toLocaleTimeString();

}

updateDateTime();

setInterval(updateDateTime, 1000);