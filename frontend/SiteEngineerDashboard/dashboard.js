// ==============================
// BuildTrack - Site Engineer Dashboard
// ==============================

// Welcome Message
window.onload = function () {

    console.log("Welcome to BuildTrack Site Engineer Dashboard");

    showDate();

    highlightMenu();

    dashboardSummary();

};

// ==============================
// Current Date
// ==============================

function showDate() {

    const today = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    console.log(today.toLocaleDateString("en-US", options));

}

// ==============================
// Highlight Active Sidebar
// ==============================

function highlightMenu() {

    const menuItems = document.querySelectorAll(".sidebar ul li");

    menuItems.forEach(item => {

        item.addEventListener("click", function () {

            menuItems.forEach(li => li.classList.remove("active"));

            this.classList.add("active");

        });

    });

}

// ==============================
// Dashboard Summary
// ==============================

function dashboardSummary() {

    const summary = {

        assignedProjects: 8,

        progress: "74%",

        pendingReports: 3,

        equipmentAlerts: 5

    };

    console.log(summary);

}

// ==============================
// Notification
// ==============================

function showNotification(message) {

    alert(message);

}

// Example

// showNotification("New Project Assigned");

// ==============================
// Future Backend API Placeholder
// ==============================

// function loadDashboardData() {
//
//     fetch("API_URL")
//
//     .then(response => response.json())
//
//     .then(data => {
//
//         console.log(data);
//
//     });
//
// }

// ==============================
// Logout
// ==============================

function logout() {

    let confirmLogout = confirm("Are you sure you want to logout?");

    if (confirmLogout) {

        window.location.href = "../login/login.html";

    }

}

// ==============================
// End
// ==============================