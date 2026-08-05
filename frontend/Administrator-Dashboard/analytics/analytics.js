// =========================================
// Analytics Dashboard JavaScript
// =========================================

// Page Loaded
window.onload = function () {
    console.log("Analytics Dashboard Loaded Successfully");
};

// Search Analytics Table
const searchInput = document.getElementById("searchAnalytics");

searchInput.addEventListener("keyup", function () {

    const filter = this.value.toLowerCase();

    const rows = document.querySelectorAll("#analyticsTable tr");

    rows.forEach(row => {

        const project = row.cells[0].textContent.toLowerCase();
        const manager = row.cells[1].textContent.toLowerCase();
        const status = row.cells[4].textContent.toLowerCase();

        if (
            project.includes(filter) ||
            manager.includes(filter) ||
            status.includes(filter)
        ) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }

    });

});

// Project Row Click
const analyticsRows = document.querySelectorAll("#analyticsTable tr");

analyticsRows.forEach(row => {

    row.addEventListener("click", function () {

        const project = this.cells[0].textContent;
        const progress = this.cells[2].textContent;

        alert(
            "Project : " + project +
            "\nProgress : " + progress
        );

    });

});

// Summary Card Hover Effect
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

// Summary Section Click
const summaryItems = document.querySelectorAll(".summary-card li");

summaryItems.forEach(item => {

    item.addEventListener("click", function () {

        alert(this.textContent);

    });

});

// Statistics Box Hover
const statBoxes = document.querySelectorAll(".stat-box");

statBoxes.forEach(box => {

    box.addEventListener("mouseenter", function () {

        this.style.transform = "scale(1.03)";
        this.style.transition = "0.3s";

    });

    box.addEventListener("mouseleave", function () {

        this.style.transform = "scale(1)";

    });

});

// Sidebar Active Menu
const menuItems = document.querySelectorAll(".sidebar ul li");

menuItems.forEach(item => {

    item.addEventListener("click", function () {

        menuItems.forEach(menu => {

            menu.classList.remove("active");

        });

        this.classList.add("active");

    });

});

// Logout
function logout() {

    const confirmLogout = confirm(
        "Are you sure you want to logout?"
    );

    if (confirmLogout) {

        window.location.href = "../login.html";

    }

}

// Live Date & Time
const header = document.querySelector("header");

const dateTime = document.createElement("p");

dateTime.style.fontSize = "14px";
dateTime.style.color = "#555";
dateTime.style.marginTop = "8px";

header.appendChild(dateTime);

function updateDateTime() {

    const now = new Date();

    dateTime.textContent =
        now.toLocaleDateString() +
        " | " +
        now.toLocaleTimeString();

}

updateDateTime();

setInterval(updateDateTime, 1000);