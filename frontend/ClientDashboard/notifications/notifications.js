// =======================================
// Client Notifications JavaScript
// =======================================

// Page Loaded
window.onload = function () {
    console.log("Client Notifications Page Loaded Successfully");
};

// ===============================
// Search Notifications
// ===============================

const searchInput = document.getElementById("searchNotification");

if (searchInput) {

    searchInput.addEventListener("keyup", function () {

        const filter = this.value.toLowerCase();
        const rows = document.querySelectorAll("#notificationTable tr");

        rows.forEach(row => {

            const id = row.cells[0].textContent.toLowerCase();
            const message = row.cells[1].textContent.toLowerCase();
            const status = row.cells[3].textContent.toLowerCase();

            if (
                id.includes(filter) ||
                message.includes(filter) ||
                status.includes(filter)
            ) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }

        });

    });

}

// ===============================
// Row Click
// ===============================

const rows = document.querySelectorAll("#notificationTable tr");

rows.forEach(row => {

    row.addEventListener("click", function () {

        const message = this.cells[1].textContent;

        alert("Notification\n\n" + message);

    });

});

// ===============================
// Recent Updates Click
// ===============================

const updates = document.querySelectorAll(".recent-updates li");

updates.forEach(item => {

    item.addEventListener("click", function () {

        alert(this.textContent);

    });

});

// ===============================
// Statistics Hover Animation
// ===============================

const cards = document.querySelectorAll(".stat-card");

cards.forEach(card => {

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

        menuItems.forEach(menu => menu.classList.remove("active"));

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

if (header) {

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

}