// Welcome Message
window.onload = function () {
    console.log("Client Dashboard Loaded Successfully");
};



// Sidebar Active Menu
const menuItems = document.querySelectorAll(".sidebar ul li");

menuItems.forEach(item => {
    item.addEventListener("click", function () {

        menuItems.forEach(i => i.classList.remove("active"));

        this.classList.add("active");

    });
});



// Logout
function logout() {

    let confirmLogout = confirm("Are you sure you want to logout?");

    if (confirmLogout) {

        window.location.href = "../login.html";

    }

}



// Project Progress Animation
const progressBars = document.querySelectorAll(".progress-fill");

window.addEventListener("load", () => {

    progressBars.forEach(bar => {

        let width = bar.innerHTML;

        bar.style.width = width;

    });

});



// Open Report
const reportRows = document.querySelectorAll(".reports tbody tr");

reportRows.forEach(row => {

    row.addEventListener("click", () => {

        let reportName = row.cells[1].innerText;

        alert(reportName + " opened successfully.");

    });

});



// Open Document
const documents = document.querySelectorAll(".documents li");

documents.forEach(doc => {

    doc.addEventListener("click", () => {

        alert("Opening " + doc.innerText);

    });

});



// Notification Click
const notifications = document.querySelectorAll(".box ul li");

notifications.forEach(notification => {

    notification.addEventListener("click", () => {

        alert(notification.innerText);

    });

});



// Dashboard Cards Hover Effect
const cards = document.querySelectorAll(".card");

cards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-8px)";
        card.style.transition = "0.3s";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "translateY(0px)";

    });

});



// Current Date and Time (Optional)
const header = document.querySelector("header");

const date = document.createElement("p");

date.style.color = "#555";
date.style.fontSize = "14px";
date.style.marginTop = "10px";

function updateDateTime() {

    const now = new Date();

    date.innerHTML = now.toLocaleString();

}

updateDateTime();

setInterval(updateDateTime, 1000);

header.appendChild(date);