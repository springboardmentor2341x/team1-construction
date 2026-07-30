// ===========================================
// BuildTrack - Worker Dashboard
// ===========================================

window.onload = function () {

    console.log("Worker Dashboard Loaded Successfully");

    loadDashboard();

};

// ===========================================
// Load Dashboard Data
// ===========================================

function loadDashboard() {

    console.log("Loading Worker Dashboard...");

    // Future Backend API Call
    // Dashboard details will be loaded here.

}

// ===========================================
// Navigate Functions
// ===========================================

function openMyTasks() {

    window.location.href = "../mytasks/mytasks.html";

}

function openAttendance() {

    window.location.href = "../attendance/attendance.html";

}

function openShiftSchedule() {

    window.location.href = "../shiftschedule/shiftschedule.html";

}

function openProfile() {

    window.location.href = "../profile/profile.html";

}

// ===========================================
// Refresh Dashboard
// ===========================================

function refreshDashboard() {

    console.log("Refreshing Dashboard...");

    loadDashboard();

}

// ===========================================
// Future Backend API
// ===========================================

// async function getWorkerDashboard(){
//
// const response = await fetch(
//
// "http://localhost:5000/api/worker/dashboard"
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