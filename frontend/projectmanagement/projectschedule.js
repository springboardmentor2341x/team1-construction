// ===========================================
// BuildTrack - Project Schedule
// ===========================================

window.onload = function () {

    console.log("Project Schedule Page Loaded Successfully");

    initializeScheduleForm();

};

// ===========================================
// Initialize Form
// ===========================================

function initializeScheduleForm() {

    const form = document.getElementById("scheduleForm");

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        saveSchedule();

    });

}

// ===========================================
// Save Schedule
// ===========================================

function saveSchedule() {

    const projectName =
        document.querySelector('input[type="text"]').value.trim();

    const manager =
        document.querySelectorAll("select")[0].value;

    const phase =
        document.querySelectorAll("select")[1].value;

    const activity =
        document.querySelectorAll('input[type="text"]')[1].value.trim();

    const startDate =
        document.querySelectorAll('input[type="date"]')[0].value;

    const endDate =
        document.querySelectorAll('input[type="date"]')[1].value;

    const duration =
        document.querySelector('input[type="number"]').value;

    const status =
        document.querySelectorAll("select")[2].value;

    const engineer =
        document.querySelectorAll("select")[3].value;

    const contractor =
        document.querySelectorAll("select")[4].value;

    const remarks =
        document.querySelector("textarea").value.trim();

    // ==========================
    // Validation
    // ==========================

    if (
        projectName === "" ||
        activity === "" ||
        duration === "" ||
        startDate === "" ||
        endDate === ""
    ) {

        alert("Please fill all required fields.");

        return;

    }

    if (manager === "Select Manager") {

        alert("Please select Project Manager.");

        return;

    }

    if (engineer === "Select Site Engineer") {

        alert("Please assign Site Engineer.");

        return;

    }

    if (contractor === "Select Contractor") {

        alert("Please assign Contractor.");

        return;

    }

    if (new Date(startDate) > new Date(endDate)) {

        alert("End Date should be after Start Date.");

        return;

    }

    const schedule = {

        projectName,
        manager,
        phase,
        activity,
        startDate,
        endDate,
        duration,
        status,
        engineer,
        contractor,
        remarks

    };

    console.log(schedule);

    alert("Project Schedule Saved Successfully!");

    document.getElementById("scheduleForm").reset();

}

// ===========================================
// Future Backend API
// ===========================================

// async function saveScheduleAPI(schedule){
//
// const response = await fetch(
//
// "http://localhost:5000/api/project/schedule",
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
// body:JSON.stringify(schedule)
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