const search = document.getElementById("search");
const roleFilter = document.getElementById("roleFilter");
const table = document.getElementById("userTable");


function filterUsers(){

    let searchValue = search.value.toLowerCase();

    let roleValue = roleFilter.value;


    let rows = table.getElementsByTagName("tr");


    for(let row of rows){


        let name = row.cells[1].textContent.toLowerCase();

        let role = row.cells[3].textContent;


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



search.addEventListener(
"keyup",
filterUsers
);


roleFilter.addEventListener(
"change",
filterUsers
);





// Delete User

let deleteButtons =
document.querySelectorAll(".delete");


deleteButtons.forEach(button=>{


button.addEventListener("click",()=>{


let confirmDelete =
confirm("Are you sure you want to delete this user?");


if(confirmDelete){

button.closest("tr").remove();

}


});


});





// Edit User


let editButtons =
document.querySelectorAll(".edit");


editButtons.forEach(button=>{


button.addEventListener("click",()=>{


alert("Edit User feature will be connected with backend later");


});


});