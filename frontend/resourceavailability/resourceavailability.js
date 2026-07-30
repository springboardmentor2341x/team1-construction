// ==========================================
// BuildTrack - Resource Availability
// ==========================================

window.onload = function () {

    console.log("Resource Availability Page Loaded Successfully");

    initializeSearch();

    loadResources();

};

// ==========================================
// Search Resources
// ==========================================

function initializeSearch() {

    const searchButton = document.querySelector(".search-box button");

    searchButton.addEventListener("click", function () {

        const resourceName =
            document.querySelector('input[type="text"]').value.trim();

        const category =
            document.querySelector("select").value;

        if (resourceName === "" && category === "All Categories") {

            alert("Please enter Resource Name or select Category.");

            return;

        }

        alert(
            "Searching Resources...\n\n" +
            "Resource : " + resourceName +
            "\nCategory : " + category
        );

    });

}

// ==========================================
// Load Resource Data
// ==========================================

function loadResources() {

    console.log("Loading Available Resources...");

}

// ==========================================
// Allocate Resource
// ==========================================

function allocateResource(resourceName) {

    alert(resourceName + " allocated successfully.");

}

// Example
// allocateResource("Excavator");

// ==========================================
// Check Low Stock
// ==========================================

function checkLowStock(quantity) {

    if (quantity < 50) {

        console.log("Low Stock Alert!");

    } else {

        console.log("Stock Available");

    }

}

// Example
// checkLowStock(25);

// ==========================================
// Future Backend API
// ==========================================

// function fetchResources(){
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