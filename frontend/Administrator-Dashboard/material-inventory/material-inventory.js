const searchMaterial =
document.getElementById("searchMaterial");


const categoryFilter =
document.getElementById("categoryFilter");


const table =
document.getElementById("materialTable");





function filterMaterials(){


let searchValue =
searchMaterial.value.toLowerCase();


let categoryValue =
categoryFilter.value;



let rows =
table.getElementsByTagName("tr");



for(let row of rows){


let materialName =
row.cells[1].textContent.toLowerCase();



let category =
row.cells[2].textContent;



let searchMatch =
materialName.includes(searchValue);



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





searchMaterial.addEventListener(
"keyup",
filterMaterials
);



categoryFilter.addEventListener(
"change",
filterMaterials
);







// Delete Material

document.querySelectorAll(".delete")
.forEach(button=>{


button.onclick=function(){


let result =
confirm("Delete this material?");


if(result){

this.closest("tr").remove();

}


}


});







// Update Stock

document.querySelectorAll(".update")
.forEach(button=>{


button.onclick=function(){


let quantity =
prompt("Enter new quantity:");



if(quantity){

this.closest("tr").cells[3].innerText=quantity;

alert("Stock updated successfully");

}


}


});







// Edit Material

document.querySelectorAll(".edit")
.forEach(button=>{


button.onclick=function(){


alert("Edit material details");


}


});







// Add Material

document.querySelector(".add-btn")
.onclick=function(){


alert("Add material form will open");


}