// =====================================
// BuildTrack - Daily Progress
// =====================================

window.onload = function () {

    console.log("Daily Progress Page Loaded");

    displayCurrentDate();

    initializeForm();

};

// =====================================
// Display Current Date
// =====================================

function displayCurrentDate() {

    const today = new Date();

    console.log("Today's Date :", today.toDateString());

}

// =====================================
// Form Submit
// =====================================

function initializeForm() {

    const form = document.querySelector("form");

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const project =
            document.querySelector('input[type="text"]').value;

        const date =
            document.querySelector('input[type="date"]').value;

        if (project === "" || date === "") {

            alert("Please fill all required fields.");

            return;

        }

        alert("Daily Progress Submitted Successfully!");

        form.reset();

    });

}

// =====================================
// Future API Integration
// =====================================

// function saveDailyProgress(data){
//
//      fetch("API_URL",{
//          method:"POST",
//          body:JSON.stringify(data)
//      })
//
// }

// =====================================
// End
// =====================================