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

alert("Registration Successful!");

window.location.href="../login/login.html";

});