// ===================================
// Add Material JavaScript
// ===================================


// Page Load

window.onload = function(){

    console.log("Add Material Page Loaded Successfully");

};





// ===============================
// Form Validation & Submit
// ===============================


const materialForm =
document.getElementById("materialForm");



materialForm.addEventListener("submit",function(e){


    e.preventDefault();




    let materialId =
    document.getElementById("materialId").value.trim();



    let materialName =
    document.getElementById("materialName").value.trim();



    let category =
    document.getElementById("category").value;



    let quantity =
    document.getElementById("quantity").value;



    let unit =
    document.getElementById("unit").value;



    let supplier =
    document.getElementById("supplier").value.trim();



    let purchaseDate =
    document.getElementById("purchaseDate").value;



    let cost =
    document.getElementById("cost").value;



    let stockStatus =
    document.getElementById("stockStatus").value;







    // Empty Field Validation


    if(

        materialId === "" ||
        materialName === "" ||
        category === "" ||
        quantity === "" ||
        supplier === "" ||
        purchaseDate === "" ||
        cost === ""

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








    // Cost Validation


    if(cost <= 0){


        alert(
            "Enter a valid cost amount"
        );


        return;


    }








    // Success Message


    alert(

        "Material Added Successfully!\n\n" +

        "Material ID : " + materialId +

        "\nName : " + materialName +

        "\nCategory : " + category +

        "\nQuantity : " + quantity + " " + unit +

        "\nStock Status : " + stockStatus


    );







    // Reset Form

    materialForm.reset();





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