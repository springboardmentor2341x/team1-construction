const searchRequest =
document.getElementById("searchRequest");


const statusFilter =
document.getElementById("statusFilter");


const table =
document.getElementById("requestTable");





function filterRequests(){


let searchValue =
searchRequest.value.toLowerCase();


let statusValue =
statusFilter.value;



let rows =
table.getElementsByTagName("tr");



for(let row of rows){


let material =
row.cells[1].textContent.toLowerCase();



let status =
row.cells[5].innerText.trim();



let searchMatch =
material.includes(searchValue);



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





searchRequest.addEventListener(
"keyup",
filterRequests
);



statusFilter.addEventListener(
"change",
filterRequests
);







// Approve Request


document.querySelectorAll(".approve")
.forEach(button=>{


button.onclick=function(){


let row =
this.closest("tr");


row.cells[5].innerHTML =
'<span class="approved">Approved</span>';


alert("Request Approved");


}


});







// Reject Request


document.querySelectorAll(".reject")
.forEach(button=>{


button.onclick=function(){


let row =
this.closest("tr");


row.cells[5].innerHTML =
'<span class="rejected">Rejected</span>';


alert("Request Rejected");


}


});







// Delete Request


document.querySelectorAll(".delete")
.forEach(button=>{


button.onclick=function(){


let confirmDelete =
confirm("Delete this request?");


if(confirmDelete){

this.closest("tr").remove();

}


}


});







// Create Request


document.querySelector(".add-btn")
.onclick=function(){


alert("Create Procurement Request Form will open");


}