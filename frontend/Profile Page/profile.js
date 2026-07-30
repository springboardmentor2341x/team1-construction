const loader = document.getElementById("loader");

window.addEventListener("load", () => {

    loader.classList.add("active");

    // Fetch profile from backend
    const token = localStorage.getItem("token");

    if (token) {
        fetch("http://127.0.0.1:8000/auth/me", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                // Store full profile in localStorage
                const profile = {
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    department: data.department,
                    phone: data.mobile,
                    address: data.address,
                    employeeId: data.employee_id,
                    userId: data.employee_id
                };
                localStorage.setItem("profile", JSON.stringify(profile));
                renderProfile(profile);
            } else {
                // Fallback to localStorage
                const localProfile = JSON.parse(localStorage.getItem("profile"));
                if (localProfile) renderProfile(localProfile);
            }
            setTimeout(() => {
                loader.classList.remove("active");
                showToast("Profile Loaded Successfully");
            }, 500);
        })
        .catch(() => {
            // Fallback to localStorage
            const localProfile = JSON.parse(localStorage.getItem("profile"));
            if (localProfile) renderProfile(localProfile);
            setTimeout(() => {
                loader.classList.remove("active");
                showToast("Profile Loaded Successfully");
            }, 500);
        });
    } else {
        const localProfile = JSON.parse(localStorage.getItem("profile"));
        if (localProfile) renderProfile(localProfile);
        setTimeout(() => {
            loader.classList.remove("active");
            showToast("Profile Loaded Successfully");
        }, 500);
    }

});

function renderProfile(profile) {
    setText("displayName", profile.name);
    setText("name", profile.name);
    setText("email", profile.email);
    setText("phone", profile.phone);
    setText("department", profile.department);
    setText("role", profile.role || profile.department);
    setText("address", profile.address);
    setText("employeeId", profile.employeeId || profile.userId || "");
    setText("userId", profile.userId || profile.employeeId || "");
    setText("accountRole", profile.role || profile.department);

    // Profile photo
    const img = document.getElementById('profilePhoto');
    if (img && profile.photo) img.src = profile.photo;
}

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.innerText = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

function setText(id, value){
    const el = document.getElementById(id);
    if(!el) return;
    el.innerText = value || "";
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

        localStorage.removeItem("token");
        localStorage.removeItem("profile");

        showToast("Logout Successful");

        setTimeout(() => {

            window.location.href = "../login/login.html";

        },1000);

    }

});
