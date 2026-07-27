const loader = document.getElementById("loader");

window.addEventListener("load", () => {

    loader.classList.add("active");

    setTimeout(() => {

        loader.classList.remove("active");
        showToast("Profile Loaded Successfully");

    }, 1000);

});

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.innerText = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

const profile = JSON.parse(localStorage.getItem("profile"));

function setText(id, value){
    const el = document.getElementById(id);
    if(!el) return;
    el.innerText = value || "";
}

if(profile){
    setText("displayName", profile.name);
    setText("name", profile.name);
    setText("email", profile.email);
    setText("phone", profile.phone);
    setText("dob", profile.dob);
    setText("gender", profile.gender);
    setText("department", profile.department);
    setText("role", profile.role || profile.department);
    setText("address", profile.address);
    setText("city", profile.city);
    setText("state", profile.state);
    setText("pincode", profile.pincode);

    setText("userId", profile.userId);
    setText("accountRole", profile.role || profile.department);
    setText("accountStatus", profile.accountStatus);
    setText("joinedOn", profile.joinedOn);

}
if(profile){
    setText("displayName", profile.name);
    setText("role", profile.role || profile.department);
    setText("employeeId", profile.userId || profile.employeeId || "");
    setText("email", profile.email);
    setText("phone", profile.phone);
    setText("address", profile.address);
    setText("department", profile.department);
    const img = document.getElementById('profilePhoto');
    if(img && profile.photo) img.src = profile.photo;
}

document.querySelectorAll('#editBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        window.location.href = "Edit/Edit.html";
    });
});

document.querySelector(".change-password").addEventListener("click", () => {

    alert("Redirect to Change Password Page");

});

document.querySelector(".logout").addEventListener("click", () => {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if(confirmLogout){

        showToast("Logout Successful");

        setTimeout(() => {

            window.location.href = "login.html";

        },1000);

    }

});