// Password Toggle

const togglePassword=document.getElementById("togglePassword");
const password=document.getElementById("password");

togglePassword.addEventListener("click",()=>{

if(password.type==="password"){

password.type="text";

togglePassword.classList.replace("fa-eye","fa-eye-slash");

}

else{

password.type="password";

togglePassword.classList.replace("fa-eye-slash","fa-eye");

}

});

// Confirm Password Toggle

const toggleConfirm=document.getElementById("toggleConfirmPassword");

const confirmPassword=document.getElementById("confirmPassword");

toggleConfirm.addEventListener("click",()=>{

if(confirmPassword.type==="password"){

confirmPassword.type="text";

toggleConfirm.classList.replace("fa-eye","fa-eye-slash");

}

else{

confirmPassword.type="password";

toggleConfirm.classList.replace("fa-eye-slash","fa-eye");

}

});

// Image Preview

const profileImage=document.getElementById("profileImage");

const preview=document.getElementById("previewImage");

profileImage.addEventListener("change",function(){

const file=this.files[0];

if(file){

preview.src=URL.createObjectURL(file);

preview.style.display="block";

}

});

// Form Validation

document.getElementById("registerForm").addEventListener("submit",function(e){

    e.preventDefault();

    const full_name = document.getElementById("fullname").value.trim();
    const employee_id = document.getElementById("employeeId").value.trim();
    const email = document.getElementById("email").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const department = document.getElementById("department").value.trim();
    const role = document.getElementById("role").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    const payload = {
        full_name: full_name,
        email: email,
        password: password,
        role: role || "Client",
        department: department,
        employee_id: employee_id,
        mobile: mobile
    };

    fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(async (response) => {
        const data = await response.json();
        console.log("Status:", response.status, "Response:", data);
        if (response.ok) {
            alert("Registration Successful! Redirecting to login...");
            window.location.href="../login/login.html";
        } else {
            alert("Registration Failed: " + JSON.stringify(data.detail));
        }
    })
    .catch(err => {
        console.error("Network Error:", err);
        alert("Cannot connect to backend server!\nMake sure uvicorn is running on port 8000.\nError: " + err.message);
    });

});