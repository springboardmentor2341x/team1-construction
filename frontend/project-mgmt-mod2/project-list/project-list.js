const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const tableRows = document.querySelectorAll("#projectTable tbody tr");

// Search & Filter
function filterProjects() {

    const searchValue = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value.toLowerCase();

    tableRows.forEach(row => {

        const projectId = row.cells[0].textContent.toLowerCase();
        const projectName = row.cells[1].textContent.toLowerCase();
        const client = row.cells[2].textContent.toLowerCase();
        const status = row.cells[5].textContent.toLowerCase();

        const matchesSearch =
            projectId.includes(searchValue) ||
            projectName.includes(searchValue) ||
            client.includes(searchValue);

        const matchesStatus =
            selectedStatus === "" || status === selectedStatus;

        if (matchesSearch && matchesStatus) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }

    });

}

searchInput.addEventListener("keyup", filterProjects);
statusFilter.addEventListener("change", filterProjects);

// View Project
const viewButtons = document.querySelectorAll(".view-btn");

viewButtons.forEach(button => {

    button.addEventListener("click", function () {

        // Later backend nundi selected project details load chestham
        console.log("View Project");

    });

});

// Edit Project
const editButtons = document.querySelectorAll(".edit-btn");

editButtons.forEach(button => {

    button.addEventListener("click", function () {

        // Later backend nundi selected project edit chestham
        console.log("Edit Project");

    });

});