const searchWorker =
document.getElementById("searchWorker");


const roleFilter =
document.getElementById("roleFilter");


const table =
document.getElementById("workerTable");





function filterWorkers(){


let searchValue =
searchWorker.value.toLowerCase();



let roleValue =
roleFilter.value;



let rows =
table.getElementsByTagName("tr");



for(let row of rows){


let name =
row.cells[1].textContent.toLowerCase();



let role =
row.cells[2].textContent;



let searchMatch =
name.includes(searchValue);



let roleMatch =
roleValue==="All" || role===roleValue;



if(searchMatch && roleMatch){

row.style.display="";

}

else{

row.style.display="none";

}


}


}



searchWorker.addEventListener(
"keyup",
filterWorkers
);



roleFilter.addEventListener(
"change",
filterWorkers
);







// Delete Worker


document.querySelectorAll(".delete")
.forEach(button=>{


button.onclick=function(){


let confirmDelete =
confirm("Delete this worker?");


if(confirmDelete){

this.closest("tr").remove();

}


}


});







// Assign Worker


document.querySelectorAll(".assign")
.forEach(button=>{


button.onclick=function(){


alert("Assign worker to project page will open");


}


});






// Edit Worker


document.querySelectorAll(".edit")
.forEach(button=>{


button.onclick=function(){


alert("Edit worker details");


}


});







// Add Worker


document.querySelector(".add-btn")
.onclick=function(){


alert("Add Worker form will open");


}