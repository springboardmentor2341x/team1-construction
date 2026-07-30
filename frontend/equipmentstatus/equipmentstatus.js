// ===========================================
// BuildTrack - Equipment Status
// ===========================================

window.onload = function () {

    console.log("Equipment Status Page Loaded Successfully");

    initializeSearch();

    loadEquipment();

};

// ===========================================
// Search Equipment
// ===========================================

function initializeSearch() {

    const searchButton = document.querySelector(".search-box button");

    searchButton.addEventListener("click", function () {

        const equipmentName =
            document.querySelector('input[type="text"]').value.trim();

        const status =
            document.querySelector("select").value;

        if (equipmentName === "" && status === "All Status") {

            alert("Please enter Equipment Name or select Status.");

            return;

        }

        alert(
            "Searching Equipment...\n\n" +
            "Equipment : " + equipmentName +
            "\nStatus : " + status
        );

    });

}

// ===========================================
// Load Equipment Data
// ===========================================

function loadEquipment() {

    console.log("Loading Equipment List...");

}

// ===========================================
// Maintenance Reminder
// ===========================================

function maintenanceReminder(equipmentName) {

    alert(equipmentName + " requires maintenance.");

}

// Example
// maintenanceReminder("Crane");

// ===========================================
// Future Backend API
// ===========================================

// function fetchEquipment(){
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

// ===========================================
// End
// ===========================================