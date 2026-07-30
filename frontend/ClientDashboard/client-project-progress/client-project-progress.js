// =======================================
// Client Project Progress JavaScript
// =======================================


// Page Load

window.onload = function(){

    console.log("Client Project Progress Page Loaded");

};




// ===============================
// Progress Bar Animation
// ===============================


const progressBar = document.querySelector(".progress-fill");


if(progressBar){


    let progressValue = 65;


    let current = 0;


    let interval = setInterval(()=>{


        if(current >= progressValue){

            clearInterval(interval);

        }

        else{

            current++;

            progressBar.style.width = current + "%";

            progressBar.textContent = current + "%";

        }


    },20);


}




// ===============================
// Milestone Status Highlight
// ===============================


const rows = document.querySelectorAll(
    ".milestone-card tbody tr"
);



rows.forEach(row=>{


    const status = row.cells[1].textContent;


    if(status==="Completed"){


        row.cells[1].style.color="green";

        row.cells[1].style.fontWeight="bold";


    }


    else if(status==="In Progress"){


        row.cells[1].style.color="orange";

        row.cells[1].style.fontWeight="bold";


    }


    else if(status==="Pending"){


        row.cells[1].style.color="gray";

        row.cells[1].style.fontWeight="bold";


    }


});





// ===============================
// Recent Updates Click
// ===============================


const updates = document.querySelectorAll(
    ".updates-card li"
);



updates.forEach(update=>{


    update.addEventListener("click",function(){


        alert(this.textContent.trim());


    });


});





// ===============================
// Sidebar Active Menu
// ===============================


const menuItems = document.querySelectorAll(
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





// ===============================
// Logout
// ===============================


function logout(){


    let confirmLogout = confirm(
        "Are you sure you want to logout?"
    );



    if(confirmLogout){


        window.location.href="../../login.html";


    }


}





// ===============================
// Current Date & Time
// ===============================


const header = document.querySelector(".header");



if(header){


    const date = document.createElement("p");


    date.style.marginTop="10px";

    date.style.color="#555";

    date.style.fontSize="14px";



    header.appendChild(date);




    function updateDate(){


        let now = new Date();


        date.innerHTML =
        "Last Updated: "
        +
        now.toLocaleDateString()
        +
        " "
        +
        now.toLocaleTimeString();



    }



    updateDate();


    setInterval(updateDate,1000);



}