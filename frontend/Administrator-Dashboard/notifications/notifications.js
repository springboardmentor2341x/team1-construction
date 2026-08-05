// =====================================
// Notifications Page JavaScript
// =====================================

// Page Loaded
window.onload = function () {
    console.log("Notifications Page Loaded Successfully");
};

// Search Notifications
const searchInput = document.getElementById("searchNotification");

searchInput.addEventListener("keyup", function () {

    const filter = this.value.toLowerCase();

    const rows = document.querySelectorAll("#notificationTable tr");

    rows.forEach(row => {

        const message = row.cells[1].textContent.toLowerCase();
        const priority = row.cells[2].textContent.toLowerCase();

        if (
            message.includes(filter) ||
            priority.includes(filter)
        ) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }

    });

});

// Mark Read / View Button
const readButtons = document.querySelectorAll(".read-btn");

readButtons.forEach(button => {

    button.addEventListener("click", function () {

        const row = this.parentElement.parentElement;

        const statusCell = row.cells[4];

        if (statusCell.textContent.trim() === "Unread") {

            statusCell.textContent = "Read";

            this.textContent = "View";

            alert("Notification marked as Read.");

        } else {

            alert("Viewing notification.");

        }

    });

});

// Mark All Read
const markAllBtn = document.querySelector(".mark-all-btn");

markAllBtn.addEventListener("click", function () {

    const rows = document.querySelectorAll("#notificationTable tr");

    rows.forEach(row => {

        row.cells[4].textContent = "Read";

        row.querySelector(".read-btn").textContent = "View";

    });

    alert("All notifications marked as Read.");

});

// Clear Notifications
const clearBtn = document.querySelector(".clear-btn");

clearBtn.addEventListener("click", function () {

    const confirmClear = confirm("Clear all notifications?");

    if (confirmClear) {

        document.getElementById("notificationTable").innerHTML = "";

        alert("Notifications cleared.");

    }

});

// Sidebar Active Menu
const menuItems = document.querySelectorAll(".sidebar ul li");

menuItems.forEach(item => {

    item.addEventListener("click", function () {

        menuItems.forEach(menu => menu.classList.remove("active"));

        this.classList.add("active");

    });

});

// Recent Activities Click
const activities = document.querySelectorAll(".recent-notifications li");

activities.forEach(item => {

    item.addEventListener("click", function () {

        alert(this.textContent);

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