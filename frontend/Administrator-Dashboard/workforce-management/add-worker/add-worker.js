// ===================================
// Add Worker JavaScript
// ===================================


// Page Load

window.onload = function(){

    console.log("Add Worker Page Loaded Successfully");

};





// ===============================
// Form Validation & Submit
// ===============================


const workerForm =
document.getElementById("workerForm");



workerForm.addEventListener("submit",function(e){


    e.preventDefault();



    let workerId =
    document.getElementById("workerId").value.trim();



    let workerName =
    document.getElementById("workerName").value.trim();



    let phone =
    document.getElementById("phone").value.trim();



    let skill =
    document.getElementById("skill").value;



    let experience =
    document.getElementById("experience").value.trim();



    let project =
    document.getElementById("project").value.trim();



    let joiningDate =
    document.getElementById("joiningDate").value;



    let salary =
    document.getElementById("salary").value;



    let availability =
    document.getElementById("availability").value;






    // Empty Field Validation


    if(

        workerId === "" ||
        workerName === "" ||
        phone === "" ||
        skill === "" ||
        experience === "" ||
        project === "" ||
        joiningDate === "" ||
        salary === ""

    ){


        alert(
            "Please fill all required fields"
        );


        return;


    }






    // Phone Validation


    if(phone.length !== 10 || isNaN(phone)){


        alert(
            "Enter a valid 10 digit phone number"
        );


        return;


    }






    // Experience Validation


    if(isNaN(experience)){


        alert(
            "Experience should be in years"
        );


        return;


    }







    // Salary Validation


    if(salary <= 0){


        alert(
            "Enter a valid salary amount"
        );


        return;


    }







    // Success Message


    alert(

        "Worker Added Successfully!\n\n" +

        "Worker ID : " + workerId +

        "\nName : " + workerName +

        "\nSkill : " + skill +

        "\nStatus : " + availability


    );







    // Reset Form

    workerForm.reset();




    // Backend API integration can be added here later


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


            menu.classList.remove(
                "active"
            );


        });



        this.classList.add(
            "active"
        );


    });


});