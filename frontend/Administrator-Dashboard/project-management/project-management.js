const searchProject =
document.getElementById("searchProject");


const statusFilter =
document.getElementById("statusFilter");


const table =
document.getElementById("projectTable");





function filterProjects(){


let searchValue =
searchProject.value.toLowerCase();



let statusValue =
statusFilter.value;



let rows =
table.getElementsByTagName("tr");



for(let row of rows){


let projectName =
row.cells[1].textContent.toLowerCase();



let status =
row.cells[5].innerText.trim();



let searchMatch =
projectName.includes(searchValue);



let statusMatch =
statusValue==="All" || status===statusValue;



if(searchMatch && statusMatch){

row.style.display="";

}

else{

row.style.display="none";

}


}



}



searchProject.addEventListener(
"keyup",
filterProjects
);



statusFilter.addEventListener(
"change",
filterProjects
);







// Delete Project


let deleteButtons =
document.querySelectorAll(".delete");



deleteButtons.forEach(button=>{


button.addEventListener("click",()=>{


let result =
confirm("Delete this project?");



if(result){

button.closest("tr").remove();

}


});


});







// View Project


let viewButtons =
document.querySelectorAll(".view");



viewButtons.forEach(button=>{


button.addEventListener("click",()=>{


alert("Project details page will open here");


});


});







// Edit Project


let editButtons =
document.querySelectorAll(".edit");



editButtons.forEach(button=>{


button.addEventListener("click",()=>{


alert("Edit project page will open here");


});


});






// Create Project


document.querySelector(".create-btn")
.addEventListener("click",()=>{


window.location.href="../create-project/create-project.html";


});