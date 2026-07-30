// ===================================
// Admin Profile JavaScript
// ===================================


// Page Loaded

window.onload = function(){

    console.log("Admin Profile Loaded Successfully");

};





// ===============================
// Edit Profile
// ===============================


const editBtn = document.getElementById("editBtn");


if(editBtn){


    editBtn.addEventListener("click",function(){


        const inputs = document.querySelectorAll(
            ".details-grid input"
        );


        inputs.forEach(input=>{


            input.removeAttribute("readonly");


            input.style.background="#ffffff";

            input.style.border="1px solid #2563eb";


        });



        this.textContent="Save Profile";


        this.style.background="#16a34a";



        this.addEventListener("click",function(){


            inputs.forEach(input=>{


                input.setAttribute(
                    "readonly",
                    true
                );


                input.style.background="#f8fafc";


                input.style.border="1px solid #ddd";


            });



            this.textContent="Edit Profile";


            this.style.background="#2563eb";


            alert(
                "Profile updated successfully!"
            );


        });


    });


}





// ===============================
// Change Password
// ===============================


const passwordBtn =
document.getElementById("passwordBtn");



if(passwordBtn){


    passwordBtn.addEventListener("click",function(){


        let newPassword =
        prompt(
            "Enter your new password:"
        );


        if(newPassword){


            if(newPassword.length < 6){


                alert(
                    "Password must contain at least 6 characters"
                );


            }

            else{


                alert(
                    "Password changed successfully!"
                );


            }


        }


    });


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
// Display Current Date & Time
// ===============================


const header =
document.querySelector("header");



if(header){


    const dateTime =
    document.createElement("p");



    dateTime.style.fontSize="14px";

    dateTime.style.color="#555";

    dateTime.style.marginTop="8px";



    header.appendChild(dateTime);




    function updateTime(){


        let now = new Date();



        dateTime.textContent =
        "Last Login: "
        +
        now.toLocaleDateString()
        +
        " "
        +
        now.toLocaleTimeString();



    }



    updateTime();


    setInterval(
        updateTime,
        1000
    );


}