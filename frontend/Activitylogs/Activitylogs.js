// ==========================================
// BuildTrack - Activity Logs
// ==========================================

window.onload = function () {

    console.log("Activity Logs Loaded Successfully");

    initializeSearch();

    loadActivities();

};

// ==========================================
// Search Function
// ==========================================

function initializeSearch() {

    const searchBtn = document.querySelector(".search-box button");

    searchBtn.addEventListener("click", function () {

        const activity =
            document.querySelector('input[type="text"]').value;

        const date =
            document.querySelector('input[type="date"]').value;

        if (activity === "" && date === "") {

            alert("Please enter Activity Name or Date.");

            return;

        }

        alert(
            "Searching...\n\nActivity : " +
            activity +
            "\nDate : " +
            date
        );

    });

}

// ==========================================
// Load Activities
// ==========================================

function loadActivities() {

    console.log("Loading Activity Logs...");

}

// ==========================================
// Add New Activity
// ==========================================

function addActivity(activityName) {

    console.log("Activity Added : " + activityName);

}

// ==========================================
// Delete Activity
// ==========================================

function deleteActivity(id) {

    console.log("Delete Activity ID :", id);

}

// ==========================================
// Future Backend API
// ==========================================

// function fetchActivityLogs(){
//
// fetch("API_URL")
//
// .then(response => response.json())
//
// .then(data=>{
//
// console.log(data);
//
// });
//
// }

// ==========================================
// End
// ==========================================