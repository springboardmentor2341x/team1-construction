// view-project.js

document.addEventListener("DOMContentLoaded", function () {

    console.log("View Project Page Loaded");

    // Future Backend Integration
    // Example:
    //
    // const params = new URLSearchParams(window.location.search);
    // const projectId = params.get("id");
    //
    // fetch(`http://localhost:8080/api/projects/${projectId}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         document.getElementById("projectName").value = data.projectName;
    //         document.getElementById("clientName").value = data.clientName;
    //         ...
    //     });

});


// Back Button

const backButton = document.querySelector(".cancel-btn");

backButton.addEventListener("click", function () {

    console.log("Returning to Project List");

});


// Edit Button

const editButton = document.querySelector(".edit-btn");

editButton.addEventListener("click", function () {

    console.log("Opening Edit Project");

});