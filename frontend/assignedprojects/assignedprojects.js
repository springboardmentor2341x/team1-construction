// ===========================================
// BuildTrack - Assigned Projects
// ===========================================

window.onload = function () {

    console.log("Assigned Projects Page Loaded");

    initializeSearch();

    initializeButtons();

};

// ===========================================
// Search Function
// ===========================================

function initializeSearch() {

    const searchBtn = document.querySelector(".search-box button");

    searchBtn.addEventListener("click", function () {

        const searchValue = document
            .querySelector(".search-box input")
            .value
            .trim();

        if (searchValue === "") {

            alert("Please enter a project name.");

            return;

        }

        alert("Searching Project : " + searchValue);

    });

}

// ===========================================
// View Details Button
// ===========================================

function initializeButtons() {

    const buttons = document.querySelectorAll(".project-card button");

    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            const projectName =
                this.parentElement.querySelector("h2").innerText;

            alert(projectName + " Details will be available soon.");

        });

    });

}

// ===========================================
// Future Backend Integration
// ===========================================

// async function getAssignedProjects() {
//
//     const response = await fetch(
//         "http://localhost:5000/api/siteengineer/projects"
//     );
//
//     const data = await response.json();
//
//     console.log(data);
//
// }

// ===========================================
// Logout Function (Future)
// ===========================================

// function logout(){
//
//     window.location.href="../login/login.html";
//
// }

// ===========================================
// End
// ===========================================