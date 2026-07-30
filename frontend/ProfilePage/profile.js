// ===========================================
// BuildTrack - Profile Page
// ===========================================


window.onload = function(){

    console.log("Profile Page Loaded Successfully");

    loadProfile();

};


// ===========================================
// Load Profile Data
// ===========================================

function loadProfile(){

    console.log("Loading Profile Information...");


    // Future Backend API Integration
    // User profile data will be fetched here.


}


// ===========================================
// Edit Profile Navigation
// ===========================================

function editProfile(){

    window.location.href = "Edit/Edit.html";

}


// ===========================================
// Logout Function
// ===========================================

function logout(){

    let confirmLogout = confirm(
        "Are you sure you want to logout?"
    );


    if(confirmLogout){

        window.location.href="../login/login.html";

    }

}
<div className="profile-avatar">
  <img src="/default-profile.png" alt="Profile" />
</div>


// ===========================================
// Future API
// ===========================================


// async function getProfile(){
//
// const response = await fetch(
//
// "http://localhost:5000/api/user/profile"
//
// );
//
//
// const data = await response.json();
//
// console.log(data);
//
// }


// ===========================================
// End
// ===========================================