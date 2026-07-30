// ===========================================
// BuildTrack - Project Status Tracking
// ===========================================

window.onload = function () {

    console.log("Project Status Page Loaded Successfully");

    initializeStatusForm();

};

// ===========================================
// Initialize Form
// ===========================================

function initializeStatusForm() {

    const form = document.getElementById("statusForm");

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        updateProjectStatus();

    });

}

// ===========================================
// Update Project Status
// ===========================================

function updateProjectStatus() {

    const projectName =
        document.querySelector('input[type="text"]').value.trim();

    const status =
        document.querySelector("select").value;

    const completion =
        document.querySelector('input[type="number"]').value;

    const updatedDate =
        document.querySelector('input[type="date"]').value;

    const remarks =
        document.querySelector("textarea").value.trim();

    // ==========================
    // Validation
    // ==========================

    if (
        projectName === "" ||
        completion === "" ||
        updatedDate === ""
    ) {

        alert("Please fill all required fields.");

        return;

    }

    if (completion < 0 || completion > 100) {

        alert("Completion Percentage should be between 0 and 100.");

        return;

    }

    // ==========================
    // Status Object
    // ==========================

    const projectStatus = {

        projectName,
        status,
        completion,
        updatedDate,
        remarks

    };

    console.log(projectStatus);

    alert("Project Status Updated Successfully!");

    document.getElementById("statusForm").reset();

}

// ===========================================
// Future Backend API
// ===========================================

// async function updateProjectStatusAPI(projectStatus){
//
// const response = await fetch(
//
// "http://localhost:5000/api/project/status",
//
// {
//
// method:"PUT",
//
// headers:{
//
// "Content-Type":"application/json"
//
// },
//
// body:JSON.stringify(projectStatus)
//
// }
//
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