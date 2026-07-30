// ===========================================
// BuildTrack - Milestone Management
// ===========================================

window.onload = function () {

    console.log("Milestone Management Loaded Successfully");

    initializeMilestoneForm();

};

// ===========================================
// Initialize Form
// ===========================================

function initializeMilestoneForm() {

    const form = document.getElementById("milestoneForm");

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        saveMilestone();

    });

}

// ===========================================
// Save Milestone
// ===========================================

function saveMilestone() {

    const projectName =
        document.querySelectorAll('input[type="text"]')[0].value.trim();

    const milestoneName =
        document.querySelectorAll('input[type="text"]')[1].value.trim();

    const plannedDate =
        document.querySelectorAll('input[type="date"]')[0].value;

    const actualDate =
        document.querySelectorAll('input[type="date"]')[1].value;

    const status =
        document.querySelector("select").value;

    const completion =
        document.querySelector('input[type="number"]').value;

    const remarks =
        document.querySelector("textarea").value.trim();

    // ==========================
    // Validation
    // ==========================

    if (
        projectName === "" ||
        milestoneName === "" ||
        plannedDate === "" ||
        completion === ""
    ) {

        alert("Please fill all required fields.");

        return;

    }

    if (completion < 0 || completion > 100) {

        alert("Completion Percentage must be between 0 and 100.");

        return;

    }

    if (
        actualDate !== "" &&
        new Date(actualDate) < new Date(plannedDate)
    ) {

        console.log("Milestone completed before planned date.");

    }

    const milestone = {

        projectName,
        milestoneName,
        plannedDate,
        actualDate,
        status,
        completion,
        remarks

    };

    console.log(milestone);

    alert("Milestone Saved Successfully!");

    document.getElementById("milestoneForm").reset();

}

// ===========================================
// Future Backend API
// ===========================================

// async function saveMilestoneAPI(milestone){
//
// const response = await fetch(
//
// "http://localhost:5000/api/milestones",
//
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
// body:JSON.stringify(milestone)
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