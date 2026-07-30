const searchInput = document.getElementById("searchMilestone");
const table = document.getElementById("milestoneTable");

searchInput.addEventListener("keyup", function () {

    let filter = searchInput.value.toLowerCase();
    let rows = table.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {

        let milestone = rows[i].cells[1].textContent.toLowerCase();
        let project = rows[i].cells[2].textContent.toLowerCase();

        if (
            milestone.includes(filter) ||
            project.includes(filter)
        ) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }

});

// Progress Bar Animation
window.onload = function () {

    const progressBars = document.querySelectorAll(".progress-fill");

    progressBars.forEach(bar => {

        let percentage = bar.innerText.trim();
        bar.style.width = percentage;

    });

};

// View Milestone Details
const rows = document.querySelectorAll("#milestoneTable tr");

rows.forEach(row => {

    row.addEventListener("click", function () {

        let milestoneName = row.cells[1].innerText;

        alert("Viewing details of: " + milestoneName);

    });

});

// Timeline Click
const timelineItems = document.querySelectorAll(".timeline ul li");

timelineItems.forEach(item => {

    item.addEventListener("click", function () {

        alert(this.innerText);

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