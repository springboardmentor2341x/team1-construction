// =====================================
// Reports Page JavaScript
// =====================================

// Page Loaded
window.onload = function () {
    console.log("Reports Dashboard Loaded");
};

// Search Reports
const searchInput = document.getElementById("searchReport");

searchInput.addEventListener("keyup", function () {

    const filter = this.value.toLowerCase();

    const rows = document.querySelectorAll("#reportTable tr");

    rows.forEach(row => {

        const project = row.cells[1].textContent.toLowerCase();
        const manager = row.cells[2].textContent.toLowerCase();

        if (
            project.includes(filter) ||
            manager.includes(filter)
        ) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }

    });

});

// Filter Reports
const filterReport = document.getElementById("filterReport");

filterReport.addEventListener("change", function () {

    const value = this.value.toLowerCase();

    const rows = document.querySelectorAll("#reportTable tr");

    rows.forEach(row => {

        const status = row.cells[3].textContent.toLowerCase();

        if (value === "all" || status === value) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }

    });

});

// View Report
const viewButtons = document.querySelectorAll(".view-btn");

viewButtons.forEach(button => {

    button.addEventListener("click", function () {

        const row = this.parentElement.parentElement;

        const project = row.cells[1].textContent;

        alert("Viewing report for: " + project);

    });

});

// Recent Activities
const activityRows = document.querySelectorAll(".activities tbody tr");

activityRows.forEach(row => {

    row.addEventListener("click", function () {

        const activity = row.cells[2].textContent;

        alert(activity);

    });

});

// Download Button
const downloadBtn = document.querySelector(".download-btn");

downloadBtn.addEventListener("click", function () {

    alert("Report downloaded successfully.");

});

// Export Button
const exportBtn = document.querySelector(".export-btn");

exportBtn.addEventListener("click", function () {

    alert("Report exported to Excel.");

});

// Print Button
const printBtn = document.querySelector(".print-btn");

printBtn.addEventListener("click", function () {

    window.print();

});

// Sidebar Active Menu
const menuItems = document.querySelectorAll(".sidebar ul li");

menuItems.forEach(item => {

    item.addEventListener("click", function () {

        menuItems.forEach(menu => menu.classList.remove("active"));

        this.classList.add("active");

    });

});

// Card Hover Animation
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

// Logout
function logout() {

    const confirmLogout = confirm("Are you sure you want to logout?");

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