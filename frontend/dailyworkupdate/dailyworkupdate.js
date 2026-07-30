// =========================================
// BuildTrack - Daily Work Update
// =========================================

window.onload = function () {

    console.log("Daily Work Update Loaded");

    initializeProgress();

    initializeForm();

};

// =========================================
// Progress Slider
// =========================================

function initializeProgress() {

    const slider = document.getElementById("progress");

    const progressValue = document.getElementById("progressValue");

    progressValue.innerHTML = slider.value + "%";

    slider.addEventListener("input", function () {

        progressValue.innerHTML = this.value + "%";

    });

}

// =========================================
// Submit Form
// =========================================

function initializeForm() {

    const form = document.getElementById("dailyWorkForm");

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const description =
            document.getElementById("workDescription").value.trim();

        const hours =
            document.getElementById("hoursWorked").value;

        const progress =
            document.getElementById("progress").value;

        if (description === "") {

            alert("Please enter work description.");

            return;

        }

        if (hours === "" || hours <= 0) {

            alert("Please enter valid working hours.");

            return;

        }

        alert(

            "Daily Work Update Submitted Successfully!\n\n" +

            "Hours Worked : " + hours +

            "\nProgress : " + progress + "%"

        );

        form.reset();

        document.getElementById("progressValue").innerHTML = "50%";

        document.getElementById("progress").value = 50;

    });

}

// =========================================
// Future Backend Integration
// =========================================

// async function submitDailyWork() {
//
// const response = await fetch(
//
// "http://localhost:5000/api/worker/daily-work",
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
// body:JSON.stringify({
//
// description,
// hours,
// progress
//
// })
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

// =========================================
// End
// =========================================