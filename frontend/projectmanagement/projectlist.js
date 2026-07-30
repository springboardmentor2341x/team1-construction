// ===========================================
// BuildTrack - Project List
// ===========================================

window.onload = function () {

    console.log("Project List Page Loaded Successfully");

    initializeSearch();

    initializeButtons();

};

// ===========================================
// Search Project
// ===========================================

function initializeSearch() {

    const searchButton = document.querySelector(".search-box button");

    searchButton.addEventListener("click", function () {

        const projectName =
            document.querySelector('input[type="text"]').value.trim();

        const category =
            document.querySelectorAll("select")[0].value;

        const status =
            document.querySelectorAll("select")[1].value;

        console.log("Searching Project...");

        console.log("Project :", projectName);
        console.log("Category :", category);
        console.log("Status :", status);

        alert("Search Completed!");

    });

}

// ===========================================
// Buttons
// ===========================================

function initializeButtons() {

    const viewButtons = document.querySelectorAll(".view");

    viewButtons.forEach(function(button){

        button.addEventListener("click",function(){

            alert("Opening Project Details...");

        });

    });

    const editButtons = document.querySelectorAll(".edit");

    editButtons.forEach(function(button){

        button.addEventListener("click",function(){

            alert("Opening Update Project Page...");

        });

    });

    const deleteButtons = document.querySelectorAll(".delete");

    deleteButtons.forEach(function(button){

        button.addEventListener("click",function(){

            let confirmDelete = confirm("Delete this Project?");

            if(confirmDelete){

                alert("Project Deleted Successfully.");

            }

        });

    });

}

// ===========================================
// Future Backend API
// ===========================================

// async function getProjects(){
//
// const response = await fetch(
// "http://localhost:5000/api/projects"
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