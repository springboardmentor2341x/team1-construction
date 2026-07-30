// ========================================
// BuildTrack - Weekly Reports
// ========================================

window.onload = function () {

    console.log("Weekly Reports Loaded");

    showCurrentWeek();

    initializeSearch();

};

// ========================================
// Show Current Week
// ========================================

function showCurrentWeek() {

    const today = new Date();

    console.log("Today's Date :", today.toDateString());

}

// ========================================
// Search Button
// ========================================

function initializeSearch() {

    const searchBtn = document.querySelector(".filter-box button");

    searchBtn.addEventListener("click", function () {

        const week =
            document.querySelector('input[type="week"]').value;

        const project =
            document.querySelector("select").value;

        if (week === "") {

            alert("Please select a week.");

            return;

        }

        alert(
            "Searching Reports\n\nWeek : " +
            week +
            "\nProject : " +
            project
        );

    });

}

// ========================================
// Download Report
// ========================================

const downloadBtn =
    document.querySelector(".download button");

downloadBtn.addEventListener("click", function () {

    alert("Weekly Report Download Started...");

});

// ========================================
// Future Backend API
// ========================================

// function getWeeklyReports(){
//
// fetch("API_URL")
//
// .then(res=>res.json())
//
// .then(data=>{
//
// console.log(data);
//
// })
//
// }

// ========================================
// End
// ========================================