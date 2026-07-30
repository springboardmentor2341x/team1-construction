// ===================================
// Add User JavaScript
// ===================================


// Page Loaded

window.onload = function(){

    console.log("Add User Page Loaded Successfully");

};





// ===============================
// Form Validation & Submit
// ===============================


const userForm = document.getElementById("userForm");



userForm.addEventListener("submit", function(e){


    e.preventDefault();



    let name =
    document.getElementById("name").value.trim();



    let email =
    document.getElementById("email").value.trim();



    let phone =
    document.getElementById("phone").value.trim();



    let role =
    document.getElementById("role").value;



    let username =
    document.getElementById("username").value.trim();



    let password =
    document.getElementById("password").value;



    let confirmPassword =
    document.getElementById("confirmPassword").value;



    let status =
    document.getElementById("status").value;





    // Empty Field Validation


    if(
        name === "" ||
        email === "" ||
        phone === "" ||
        role === "" ||
        username === "" ||
        password === "" ||
        confirmPassword === ""
    ){

        alert(
            "Please fill all required fields"
        );

        return;

    }





    // Email Validation


    let emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



    if(!emailPattern.test(email)){


        alert(
            "Enter a valid email address"
        );

        return;

    }






    // Phone Validation


    if(phone.length !== 10 ||
       isNaN(phone)){


        alert(
            "Enter a valid 10 digit phone number"
        );

        return;

    }







    // Password Validation


    if(password.length < 6){


        alert(
            "Password must contain minimum 6 characters"
        );


        return;


    }






    if(password !== confirmPassword){


        alert(
            "Passwords do not match"
        );


        return;


    }







    // Success Message


    alert(

        "User Added Successfully!\n\n" +

        "Name: " + name +
        "\nRole: " + role +
        "\nStatus: " + status

    );




    // After successful submission

    userForm.reset();



    // Backend Integration Later
    // send data to API here


});








// ===============================
// Logout
// ===============================


function logout(){


    let confirmLogout =
    confirm(
        "Are you sure you want to logout?"
    );



    if(confirmLogout){


        window.location.href="../../login.html";


    }


}





// ===============================
// Sidebar Active Menu
// ===============================


const menuItems =
document.querySelectorAll(
    ".sidebar ul li"
);



menuItems.forEach(item=>{


    item.addEventListener("click",function(){


        menuItems.forEach(menu=>{

            menu.classList.remove("active");

        });



        this.classList.add("active");


    });


});