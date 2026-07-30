// ===========================================
// BuildTrack - Project Creation
// ===========================================

window.onload = function () {

    console.log("Project Creation Page Loaded Successfully");

    initializeForm();

};

// ===========================================
// Initialize Form
// ===========================================

function initializeForm() {

    const form = document.getElementById("projectForm");

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        createProject();

    });

}

// ===========================================
// Create Project
// ===========================================

function createProject() {

    const projectName =
        document.querySelector('input[placeholder="Enter Project Name"]').value.trim();

    const projectCode =
        document.querySelector('input[placeholder="BT-001"]').value.trim();

    const clientName =
        document.querySelector('input[placeholder="Client Name"]').value.trim();

    const location =
        document.querySelector('input[placeholder="City, State"]').value.trim();

    const budget =
        document.querySelector('input[type="number"]').value;

    const startDate =
        document.querySelectorAll('input[type="date"]')[0].value;

    const endDate =
        document.querySelectorAll('input[type="date"]')[1].value;

    const category =
        document.querySelectorAll("select")[0].value;

    const priority =
        document.querySelectorAll("select")[1].value;

    const status =
        document.querySelectorAll("select")[2].value;

    const manager =
        document.querySelectorAll("select")[3].value;

    const description =
        document.querySelector("textarea").value.trim();

    // ==========================
    // Validation
    // ==========================

    if (
        projectName === "" ||
        projectCode === "" ||
        clientName === "" ||
        location === "" ||
        budget === "" ||
        startDate === "" ||
        endDate === "" ||
        description === ""
    ) {

        alert("Please fill all required fields.");

        return;

    }

    if (manager === "Select Project Manager") {

        alert("Please assign a Project Manager.");

        return;

    }

    if (new Date(startDate) > new Date(endDate)) {

        alert("Completion date must be after Start Date.");

        return;

    }

    // ==========================
    // Project Object
    // ==========================

    const project = {

        projectName,
        projectCode,
        category,
        clientName,
        location,
        budget,
        startDate,
        endDate,
        priority,
        status,
        manager,
        description

    };

    console.log(project);

    alert("Project Created Successfully!");

    document.getElementById("projectForm").reset();

}

// ===========================================
// Future Backend API
// ===========================================

// async function saveProject(project){
//
// const response = await fetch(
// "http://localhost:5000/api/projects",
// {
//
// method:"POST",
//
// headers:{
//
// "Content-Type":"application/json"
//
// },
//
// body:JSON.stringify(project)
//
// });
//
// const data = await response.json();
//
// console.log(data);
//
// }

// ===========================================
// End
// ===========================================