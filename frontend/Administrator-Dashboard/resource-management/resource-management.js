const searchResource =
document.getElementById("searchResource");


const categoryFilter =
document.getElementById("categoryFilter");


const table =
document.getElementById("resourceTable");





function filterResources(){


let searchValue =
searchResource.value.toLowerCase();


let categoryValue =
categoryFilter.value;



let rows =
table.getElementsByTagName("tr");



for(let row of rows){


let resourceName =
row.cells[1].textContent.toLowerCase();



let category =
row.cells[2].textContent;



let searchMatch =
resourceName.includes(searchValue);



let categoryMatch =
categoryValue==="All" || category===categoryValue;



if(searchMatch && categoryMatch){

row.style.display="";

}

else{

row.style.display="none";

}


}


}



searchResource.addEventListener(
"keyup",
filterResources
);



categoryFilter.addEventListener(
"change",
filterResources
);







// Delete Resource

document.querySelectorAll(".delete")
.forEach(button=>{


button.onclick=function(){


let confirmDelete =
confirm("Delete this resource?");


if(confirmDelete){

this.closest("tr").remove();

}


}


});







// Assign Resource

document.querySelectorAll(".assign")
.forEach(button=>{


button.onclick=function(){


alert("Assign resource to project");


}


});







// Edit Resource

document.querySelectorAll(".edit")
.forEach(button=>{


button.onclick=function(){


alert("Edit resource details");


}


});







// Add Resource

document.querySelector(".add-btn")
.onclick=function(){


alert("Add resource form will open");


}