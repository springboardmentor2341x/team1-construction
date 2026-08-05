// ===========================================
// BuildTrack - Project Details
// ===========================================

window.onload = function () {

    console.log("Project Details Loaded Successfully");

    loadProjectDetails();

    updateProgressBar();

};

// ===========================================
// Load Project Details
// ===========================================

function loadProjectDetails() {

    console.log("Fetching Project Information...");

    // Future Backend API Call
    // Data will be loaded here

}

// ===========================================
// Progress Bar Animation
// ===========================================

function updateProgressBar() {

    const progress = document.querySelector(".progress-fill");

    let percentage = 35;

    progress.style.width = percentage + "%";

    progress.innerHTML = percentage + "%";

}

// ===========================================
// Refresh Project
// ===========================================

function refreshProject() {

    alert("Project data refreshed successfully.");

    loadProjectDetails();

}

// ===========================================
// Print Project Report
// ===========================================

function printProject() {

    window.print();

}

// ===========================================
// Future Backend API
// ===========================================

// async function getProjectDetails(id){
//
// const response = await fetch(
// "http://localhost:5000/api/projects/" + id
// );
//
// const data = await response.json();
//
// console.log(data);
//
// }

// ===========================================
// End
// ===========================================