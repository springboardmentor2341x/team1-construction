// ===================================
// Add Resource JavaScript
// ===================================


// Page Load

window.onload = function(){

    console.log("Add Resource Page Loaded Successfully");

};





// ===============================
// Form Validation & Submit
// ===============================


const resourceForm =
document.getElementById("resourceForm");



resourceForm.addEventListener("submit",function(e){


    e.preventDefault();




    let resourceId =
    document.getElementById("resourceId").value.trim();



    let resourceName =
    document.getElementById("resourceName").value.trim();



    let resourceType =
    document.getElementById("resourceType").value;



    let quantity =
    document.getElementById("quantity").value;



    let availability =
    document.getElementById("availability").value;



    let project =
    document.getElementById("project").value.trim();



    let purchaseDate =
    document.getElementById("purchaseDate").value;



    let condition =
    document.getElementById("condition").value;







    // Empty Field Validation


    if(

        resourceId === "" ||
        resourceName === "" ||
        resourceType === "" ||
        quantity === "" ||
        project === "" ||
        purchaseDate === ""

    ){


        alert(
            "Please fill all required fields"
        );


        return;


    }






    // Quantity Validation


    if(quantity <= 0){


        alert(
            "Enter a valid quantity"
        );


        return;


    }








    // Success Message


    alert(

        "Resource Added Successfully!\n\n" +

        "Resource ID : " + resourceId +

        "\nName : " + resourceName +

        "\nType : " + resourceType +

        "\nQuantity : " + quantity +

        "\nStatus : " + availability +

        "\nCondition : " + condition


    );






    // Reset Form

    resourceForm.reset();




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