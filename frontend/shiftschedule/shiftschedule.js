// ===========================================
// BuildTrack - Shift Schedule
// ===========================================

window.onload = function () {

    console.log("Shift Schedule Page Loaded Successfully");

    loadShiftSchedule();

};

// ===========================================
// Load Shift Schedule
// ===========================================

function loadShiftSchedule() {

    console.log("Loading Weekly Shift Schedule...");

    // Future Backend API Call
    // Shift schedule data will be loaded here.

}

// ===========================================
// View Shift Details
// ===========================================

function viewShift(day) {

    alert("Viewing Shift Details for " + day);

}

// ===========================================
// Refresh Shift Schedule
// ===========================================

function refreshSchedule() {

    console.log("Refreshing Shift Schedule...");

    loadShiftSchedule();

}

// ===========================================
// Future Backend API
// ===========================================

// async function getShiftSchedule(){
//
// const response = await fetch(
//
// "http://localhost:5000/api/worker/shifts"
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