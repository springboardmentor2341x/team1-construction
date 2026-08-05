// ===========================================
// BuildTrack - My Tasks
// ===========================================

window.onload = function () {

    console.log("My Tasks Page Loaded Successfully");

    loadTasks();

};

// ===========================================
// Load Tasks
// ===========================================

function loadTasks() {

    console.log("Fetching Assigned Tasks...");

    // Future Backend API Call
    // Assigned tasks will be loaded here

}

// ===========================================
// View Task
// ===========================================

function viewTask(taskId) {

    alert("Opening Task : " + taskId);

}

// ===========================================
// Mark Task Completed
// ===========================================

function markCompleted(taskId) {

    let confirmTask = confirm("Mark this task as completed?");

    if(confirmTask){

        alert("Task Completed Successfully!");

        console.log(taskId + " Completed");

    }

}

// ===========================================
// Refresh Task List
// ===========================================

function refreshTasks(){

    alert("Task List Refreshed.");

    loadTasks();

}

// ===========================================
// Future Backend API
// ===========================================

// async function getMyTasks(){
//
// const response = await fetch(
//
// "http://localhost:5000/api/worker/tasks"
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