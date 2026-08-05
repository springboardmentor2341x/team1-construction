// ===========================================
// BuildTrack - Update Project
// ===========================================

window.onload = function () {

    console.log("Update Project Page Loaded Successfully");

    initializeUpdateForm();

};

// ===========================================
// Initialize Form
// ===========================================

function initializeUpdateForm() {

    const form = document.getElementById("updateProjectForm");

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        updateProject();

    });

}

// ===========================================
// Update Project
// ===========================================

function updateProject() {

    const projectName =
        document.querySelector('input[type="text"]').value.trim();

    const budget =
        document.querySelector('input[type="number"]').value;

    const location =
        document.querySelectorAll('input[type="text"]')[2].value.trim();

    const startDate =
        document.querySelectorAll('input[type="date"]')[0].value;

    const endDate =
        document.querySelectorAll('input[type="date"]')[1].value;

    if(projectName==="" || budget==="" || location===""){

        alert("Please fill all required fields.");

        return;

    }

    if(startDate!=="" && endDate!==""){

        if(new Date(startDate) > new Date(endDate)){

            alert("End Date should be after Start Date.");

            return;

        }

    }

    alert("Project Updated Successfully!");

    console.log("Project Updated.");

}

// ===========================================
// Reset Form
// ===========================================

function resetForm(){

    document.getElementById("updateProjectForm").reset();

}

// ===========================================
// Future Backend API
// ===========================================

// async function updateProjectAPI(){
//
// const response = await fetch(
//
// "http://localhost:5000/api/projects/1",
//
// {
//
// method:"PUT",
//
// headers:{
//
// "Content-Type":"application/json"
//
// },
//
// body:JSON.stringify(project)
//
// }
//
// );
//
// const data=await response.json();
//
// console.log(data);
//
// }

// ===========================================
// End
// ===========================================