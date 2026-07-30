// =====================================
// Client Reports JavaScript
// =====================================

// Page Loaded
window.onload = function () {
    console.log("Client Reports Page Loaded Successfully");
};

// ===============================
// Search Reports
// ===============================

const searchInput = document.getElementById("searchReport");

searchInput.addEventListener("keyup", function () {

    const filter = this.value.toLowerCase();

    const rows = document.querySelectorAll("#reportTable tr");

    rows.forEach(row => {

        const reportId = row.cells[0].textContent.toLowerCase();
        const reportName = row.cells[1].textContent.toLowerCase();
        const status = row.cells[3].textContent.toLowerCase();

        if (
            reportId.includes(filter) ||
            reportName.includes(filter) ||
            status.includes(filter)
        ) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }

    });

});

// ===============================
// Download Button
// ===============================

const downloadButtons = document.querySelectorAll(".download-btn");

downloadButtons.forEach(button => {

    button.addEventListener("click", function () {

        const row = this.parentElement.parentElement;

        const reportName = row.cells[1].textContent;

        alert(reportName + "\n\nDownload started...");

        // Future Backend
        // window.location.href = "reports/" + reportName + ".pdf";

    });

});

// ===============================
// Recent Reports Click
// ===============================

const reports = document.querySelectorAll(".recent-reports li");

reports.forEach(item => {

    item.addEventListener("click", function () {

        alert(this.textContent);

    });

});

// ===============================
// Statistics Card Animation
// ===============================

const statCards = document.querySelectorAll(".stat-card");

statCards.forEach(card => {

    card.addEventListener("mouseenter", function () {

        this.style.transform = "translateY(-6px)";
        this.style.transition = "0.3s";

    });

    card.addEventListener("mouseleave", function () {

        this.style.transform = "translateY(0px)";

    });

});

// ===============================
// Sidebar Active Menu
// ===============================

const menuItems = document.querySelectorAll(".sidebar ul li");

menuItems.forEach(item => {

    item.addEventListener("click", function () {

        menuItems.forEach(menu => {

            menu.classList.remove("active");

        });

        this.classList.add("active");

    });

});

// ===============================
// Logout
// ===============================

function logout() {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (confirmLogout) {

        window.location.href = "../login.html";

    }

}

// ===============================
// Live Date & Time
// ===============================

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