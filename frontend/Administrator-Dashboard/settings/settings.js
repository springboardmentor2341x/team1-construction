// ================================
// Settings Page JavaScript
// ================================

// Page Loaded
window.onload = function () {
    console.log("Settings Page Loaded Successfully");
};

// Save Settings
function saveSettings() {

    alert("Settings saved successfully!");

}

// Reset Settings
function resetSettings() {

    const confirmReset = confirm("Are you sure you want to reset all settings?");

    if (confirmReset) {

        document.querySelectorAll("input[type='text']").forEach(input => {
            input.value = "";
        });

        document.querySelectorAll("input[type='email']").forEach(input => {
            input.value = "";
        });

        document.querySelectorAll("input[type='password']").forEach(input => {
            input.value = "";
        });

        document.querySelectorAll("input[type='checkbox']").forEach(check => {
            check.checked = false;
        });

        document.querySelectorAll("select").forEach(select => {
            select.selectedIndex = 0;
        });

        alert("Settings have been reset.");

    }

}

// Sidebar Active Menu
const menuItems = document.querySelectorAll(".sidebar ul li");

menuItems.forEach(item => {

    item.addEventListener("click", function () {

        menuItems.forEach(menu => menu.classList.remove("active"));

        this.classList.add("active");

    });

});

// Input Focus Effect
const inputs = document.querySelectorAll("input, select");

inputs.forEach(input => {

    input.addEventListener("focus", function () {

        this.style.border = "2px solid #2563eb";

    });

    input.addEventListener("blur", function () {

        this.style.border = "1px solid #ccc";

    });

});

// Password Validation
const newPassword = document.querySelectorAll("input[type='password']")[1];
const confirmPassword = document.querySelectorAll("input[type='password']")[2];

confirmPassword.addEventListener("blur", function () {

    if (
        newPassword.value !== "" &&
        confirmPassword.value !== "" &&
        newPassword.value !== confirmPassword.value
    ) {

        alert("Passwords do not match!");

        confirmPassword.focus();

    }

});

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

// Logout
function logout() {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (confirmLogout) {

        window.location.href = "../login.html";

    }

}