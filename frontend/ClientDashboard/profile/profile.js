window.onload = function () {
    console.log("Client Profile Loaded Successfully");
};

// Sidebar Active Menu
const menuItems = document.querySelectorAll(".sidebar ul li");

menuItems.forEach(item => {

    item.addEventListener("click", function () {

        menuItems.forEach(menu => menu.classList.remove("active"));

        this.classList.add("active");

    });

});

// Profile Card Click
const profileCard = document.querySelector(".profile-card");

profileCard.addEventListener("click", function () {

    alert("Client Profile Information");

});

// Project Information Click
const projectTable = document.querySelector(".project-info");

projectTable.addEventListener("click", function () {

    alert("Project details are displayed below.");

});

// Support Contact Click
const supportBox = document.querySelector(".contact-box");

supportBox.addEventListener("click", function () {

    alert("For any queries, please contact the support team.");

});

// Logout Function
function logout() {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (confirmLogout) {

        window.location.href = "../login.html";

    }

}

// Display Current Date and Time
const header = document.querySelector("header");

const dateTime = document.createElement("p");

dateTime.style.fontSize = "14px";
dateTime.style.color = "#555";
dateTime.style.marginTop = "8px";

header.appendChild(dateTime);

function updateDateTime() {

    const now = new Date();

    dateTime.innerHTML =
        now.toLocaleDateString() +
        " | " +
        now.toLocaleTimeString();

}

updateDateTime();

setInterval(updateDateTime, 1000);

// Highlight Table Rows
const rows = document.querySelectorAll(".project-info table tr");

rows.forEach(row => {

    row.addEventListener("mouseenter", function () {

        this.style.backgroundColor = "#f1f5f9";

    });

    row.addEventListener("mouseleave", function () {

        this.style.backgroundColor = "";

    });

});