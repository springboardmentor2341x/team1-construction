// =====================================
// Client Documents JavaScript
// =====================================


// Page Loaded

window.onload = function(){

    console.log("Client Documents Page Loaded Successfully");

};



// ===============================
// Search Documents
// ===============================


const searchInput = document.getElementById("searchDocument");


if(searchInput){

    searchInput.addEventListener("keyup",function(){


        const filter = this.value.toLowerCase();


        const rows = document.querySelectorAll("#documentTable tr");


        rows.forEach(row=>{


            const id = row.cells[0].textContent.toLowerCase();

            const name = row.cells[1].textContent.toLowerCase();

            const category = row.cells[2].textContent.toLowerCase();



            if(
                id.includes(filter) ||
                name.includes(filter) ||
                category.includes(filter)
            ){

                row.style.display="";

            }

            else{

                row.style.display="none";

            }


        });


    });

}



// ===============================
// Download Document
// ===============================


const downloadButtons = document.querySelectorAll(".download-btn");


downloadButtons.forEach(button=>{


    button.addEventListener("click",function(){


        const row = this.closest("tr");


        const documentName = row.cells[1].textContent;


        alert(
            documentName +
            "\n\nDownload started..."
        );


        // Backend Integration Later
        // window.location.href="documents/"+documentName+".pdf";


    });


});




// ===============================
// Recent Documents Click
// ===============================


const recentDocuments = document.querySelectorAll(".recent-documents li");


recentDocuments.forEach(item=>{


    item.addEventListener("click",function(){


        alert(this.textContent);


    });


});




// ===============================
// Statistics Card Animation
// ===============================


const statCards = document.querySelectorAll(".stat-card");


statCards.forEach(card=>{


    card.addEventListener("mouseenter",function(){


        this.style.transform="translateY(-6px)";

        this.style.transition="0.3s";


    });



    card.addEventListener("mouseleave",function(){


        this.style.transform="translateY(0px)";


    });


});




// ===============================
// Sidebar Active Menu
// ===============================


const menuItems = document.querySelectorAll(".sidebar ul li");


menuItems.forEach(item=>{


    item.addEventListener("click",function(){


        menuItems.forEach(menu=>{

            menu.classList.remove("active");

        });


        this.classList.add("active");


    });


});




// ===============================
// Logout
// ===============================


function logout(){


    const confirmLogout = confirm(
        "Are you sure you want to logout?"
    );



    if(confirmLogout){


        window.location.href="../login.html";


    }


}





// ===============================
// Live Date & Time
// ===============================


const header = document.querySelector("header");


if(header){


    const dateTime = document.createElement("p");


    dateTime.style.fontSize="14px";

    dateTime.style.color="#555";

    dateTime.style.marginTop="8px";



    header.appendChild(dateTime);



    function updateDateTime(){


        const now = new Date();



        dateTime.textContent =
            now.toLocaleDateString()
            +
            " | "
            +
            now.toLocaleTimeString();


    }



    updateDateTime();


    setInterval(updateDateTime,1000);


}