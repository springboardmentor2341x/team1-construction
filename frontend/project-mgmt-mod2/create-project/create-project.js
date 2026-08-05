const form = document.getElementById("projectForm");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Input Fields
    const projectId = document.getElementById("projectId");
    const projectName = document.getElementById("projectName");
    const clientName = document.getElementById("clientName");
    const projectManager = document.getElementById("projectManager");
    const startDate = document.getElementById("startDate");
    const endDate = document.getElementById("endDate");
    const budget = document.getElementById("budget");
    const status = document.getElementById("status");
    const priority = document.getElementById("priority");
    const location = document.getElementById("location");
    const description = document.getElementById("description");

    // Clear Previous Errors
    document.querySelectorAll(".error").forEach(error => error.textContent = "");

    let isValid = true;

    // Validation Function
    function showError(id, message) {
        document.getElementById(id).textContent = message;
        isValid = false;
    }

    // Project ID
    if (projectId.value.trim() === "") {
        showError("projectIdError", "Project ID is required.");
    }

    // Project Name
    if (projectName.value.trim() === "") {
        showError("projectNameError", "Project Name is required.");
    }

    // Client Name
    if (clientName.value.trim() === "") {
        showError("clientNameError", "Client Name is required.");
    }

    // Project Manager
    if (projectManager.value === "") {
        showError("projectManagerError", "Select a Project Manager.");
    }

    // Start Date
    if (startDate.value === "") {
        showError("startDateError", "Select Start Date.");
    }

    // End Date
    if (endDate.value === "") {
        showError("endDateError", "Select End Date.");
    }

    // Date Validation
    if (startDate.value !== "" && endDate.value !== "") {
        if (new Date(endDate.value) < new Date(startDate.value)) {
            showError("endDateError", "End Date must be after Start Date.");
        }
    }

    // Budget
    if (budget.value.trim() === "") {
        showError("budgetError", "Budget is required.");
    } else if (budget.value <= 0) {
        showError("budgetError", "Budget must be greater than 0.");
    }

    // Status
    if (status.value === "") {
        showError("statusError", "Select Project Status.");
    }

    // Priority
    if (priority.value === "") {
        showError("priorityError", "Select Project Priority.");
    }

    // Location
    if (location.value.trim() === "") {
        showError("locationError", "Project Location is required.");
    }

    // Description
    if (description.value.trim() === "") {
        showError("descriptionError", "Project Description is required.");
    } else if (description.value.trim().length < 20) {
        showError("descriptionError", "Description should contain at least 20 characters.");
    }

    // Success
    if (isValid) {

    alert("Project created successfully!");

    form.reset();

    window.location.href = "../project-list/project-list.html";

}
});