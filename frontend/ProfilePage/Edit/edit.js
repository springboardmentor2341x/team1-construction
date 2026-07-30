// ===========================================
// BuildTrack - Edit Profile
// ===========================================


window.onload = function(){

    console.log("Edit Profile Page Loaded Successfully");

    initializeForm();

};



// ===========================================
// Form Submit
// ===========================================


function initializeForm(){


    const form = document.getElementById("profileForm");


    form.addEventListener("submit", function(event){


        event.preventDefault();


        updateProfile();


    });


}




// ===========================================
// Update Profile
// ===========================================


function updateProfile(){


    let name = document.querySelector(
        'input[type="text"]'
    ).value;


    let email = document.querySelector(
        'input[type="email"]'
    ).value;



    if(name === "" || email === ""){


        alert("Please fill all required details.");

        return;

    }



    let confirmUpdate = confirm(
        "Are you sure you want to update profile?"
    );



    if(confirmUpdate){


        alert(
            "Profile Updated Successfully!"
        );


        // Redirect back to profile page

        window.location.href="../Profile.html";


    }


}




// ===========================================
// Future Backend API
// ===========================================


// async function updateProfileAPI(){
//
// const response = await fetch(
//
// "http://localhost:5000/api/user/update-profile",
//
// {
//
// method:"PUT",
//
// headers:{
//
// "Content-Type":"application/json"
//
// },
//
// body:JSON.stringify(profileData)
//
// }
//
// );
//
// const data = await response.json();
//
// console.log(data);
//
// }




// ===========================================
// End
// ===========================================