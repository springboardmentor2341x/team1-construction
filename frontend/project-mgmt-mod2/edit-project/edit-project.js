const form = document.getElementById("editProjectForm");

form.addEventListener("submit", function (e) {

    e.preventDefault();

    // Input Fields
    const projectName = document.getElementById("projectName");
    const clientName = document.getElementById("clientName");
    const budget = document.getElementById("budget");
    const startDate = document.getElementById("startDate");
    const endDate = document.getElementById("endDate");
    const location = document.getElementById("location");
    const description = document.getElementById("description");

    // Clear Previous Errors
    document.querySelectorAll(".error").forEach(error => {
        error.textContent = "";
    });

    let isValid = true;

    function showError(id, message) {
        document.getElementById(id).textContent = message;
        isValid = false;
    }

    // Project Name
    if (projectName.value.trim() === "") {
        showError("projectNameError", "Project Name is required.");
    }

    // Client Name
    if (clientName.value.trim() === "") {
        showError("clientNameError", "Client Name is required.");
    }

    // Budget
    if (budget.value === "" || Number(budget.value) <= 0) {
        showError("budgetError", "Enter a valid budget.");
    }

    // Date Validation
    if (startDate.value !== "" && endDate.value !== "") {

        if (new Date(endDate.value) < new Date(startDate.value)) {

            alert("End Date cannot be earlier than Start Date.");
            isValid = false;

        }

    }

    // Location
    if (location.value.trim() === "") {

        alert("Project Location is required.");
        isValid = false;

    }

    // Description
    if (description.value.trim().length < 20) {

        alert("Description should contain at least 20 characters.");
        isValid = false;

    }

    if (isValid) {

        alert("Project updated successfully!");

        console.log({
            projectName: projectName.value,
            clientName: clientName.value,
            budget: budget.value,
            startDate: startDate.value,
            endDate: endDate.value,
            location: location.value,
            description: description.value
        });

        // Later replace with backend API
        // fetch("/api/projects/update", {...})

        window.location.href = "../project-list/project-list.html";

    }

});