// ===========================================
// BuildTrack - Worker Attendance
// ===========================================

window.onload = function () {

    console.log("Attendance Page Loaded Successfully");

    initializeAttendanceForm();

};

// ===========================================
// Initialize Form
// ===========================================

function initializeAttendanceForm() {

    const form = document.getElementById("attendanceForm");

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        saveAttendance();

    });

}

// ===========================================
// Save Attendance
// ===========================================

function saveAttendance() {

    const date =
        document.querySelector('input[type="date"]').value;

    const shift =
        document.querySelectorAll("select")[0].value;

    const checkIn =
        document.querySelectorAll('input[type="time"]')[0].value;

    const checkOut =
        document.querySelectorAll('input[type="time"]')[1].value;

    const status =
        document.querySelectorAll("select")[1].value;

    // ==========================
    // Validation
    // ==========================

    if (
        date === "" ||
        checkIn === "" ||
        checkOut === ""
    ) {

        alert("Please fill all required fields.");

        return;

    }

    const attendance = {

        date,
        shift,
        checkIn,
        checkOut,
        status

    };

    console.log(attendance);

    alert("Attendance Saved Successfully!");

    document.getElementById("attendanceForm").reset();

}

// ===========================================
// Refresh Attendance
// ===========================================

function refreshAttendance() {

    console.log("Attendance Refreshed");

}

// ===========================================
// Future Backend API
// ===========================================

// async function saveAttendanceAPI(attendance){
//
// const response = await fetch(
//
// "http://localhost:5000/api/worker/attendance",
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
// body:JSON.stringify(attendance)
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