const form = document.getElementById("loginForm");

form.addEventListener("submit", function(e){

    e.preventDefault();

    let email=document.getElementById("email").value.trim();
    let password=document.getElementById("password").value.trim();

    let emailError=document.getElementById("emailError");
    let passwordError=document.getElementById("passwordError");

    emailError.textContent="";
    passwordError.textContent="";

    let valid=true;

    const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(email===""){

        emailError.textContent="Email is required";
        valid=false;

    }
    else if(!emailPattern.test(email)){

        emailError.textContent="Enter a valid email";
        valid=false;

    }

    if(password===""){

        passwordError.textContent="Password is required";
        valid=false;

    }
    else if(password.length<8){

        passwordError.textContent="Password must be at least 8 characters";
        valid=false;

    }

    if(valid){

        alert("Login Successful!");

        // Backend API call will be added later

    }

});

const passwordModal = document.getElementById("passwordModal");
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const changePasswordLink = document.getElementById("changePasswordLink");
const closePasswordModal = document.getElementById("closePasswordModal");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const backToEmailBtn = document.getElementById("backToEmailBtn");
const backToOtpBtn = document.getElementById("backToOtpBtn");
const doneBtn = document.getElementById("doneBtn");

let currentMode = "forgot";
let generatedOtp = "123456";

function showStep(stepId){
    document.querySelectorAll(".step").forEach(step => step.classList.remove("active"));
    document.getElementById(stepId).classList.add("active");
}

function clearErrors(){
    document.getElementById("recoverEmailError").textContent = "";
    document.getElementById("otpError").textContent = "";
    document.getElementById("newPasswordError").textContent = "";
    document.getElementById("confirmPasswordError").textContent = "";
    document.getElementById("currentPasswordError").textContent = "";
}

function openPasswordModal(mode){
    currentMode = mode;
    clearErrors();
    document.getElementById("recoverEmail").value = "";
    document.getElementById("otpCode").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmPassword").value = "";
    document.getElementById("currentPassword").value = "";
    document.getElementById("modalTitle").textContent = mode === "change" ? "Change Password" : "Forgot Password";
    document.getElementById("modalSubtitle").textContent = mode === "change"
        ? "Update your account password securely."
        : "Enter your email to receive an OTP.";
    document.getElementById("currentPasswordGroup").style.display = mode === "change" ? "block" : "none";
    document.getElementById("otpHelper").textContent = "Demo OTP: 123456";
    generatedOtp = "123456";
    showStep("stepEmail");
    passwordModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
}

function closePasswordModalHandler(){
    passwordModal.classList.add("hidden");
    document.body.classList.remove("modal-open");
}

forgotPasswordLink.addEventListener("click", function(e){
    e.preventDefault();
    openPasswordModal("forgot");
});

changePasswordLink.addEventListener("click", function(e){
    e.preventDefault();
    openPasswordModal("change");
});

closePasswordModal.addEventListener("click", closePasswordModalHandler);

passwordModal.addEventListener("click", function(e){
    if(e.target === passwordModal){
        closePasswordModalHandler();
    }
});

sendOtpBtn.addEventListener("click", function(){
    const email = document.getElementById("recoverEmail").value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    document.getElementById("recoverEmailError").textContent = "";

    if(email === ""){
        document.getElementById("recoverEmailError").textContent = "Email is required";
        return;
    }

    if(!emailPattern.test(email)){
        document.getElementById("recoverEmailError").textContent = "Enter a valid email";
        return;
    }

    showStep("stepOtp");
});

verifyOtpBtn.addEventListener("click", function(){
    const otp = document.getElementById("otpCode").value.trim();
    document.getElementById("otpError").textContent = "";

    if(otp === ""){
        document.getElementById("otpError").textContent = "OTP is required";
        return;
    }

    if(otp.length !== 6 || otp !== generatedOtp){
        document.getElementById("otpError").textContent = "Invalid OTP. Please try again.";
        return;
    }

    showStep("stepReset");
});

resetPasswordBtn.addEventListener("click", function(){
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const currentPassword = document.getElementById("currentPassword").value;

    document.getElementById("newPasswordError").textContent = "";
    document.getElementById("confirmPasswordError").textContent = "";
    document.getElementById("currentPasswordError").textContent = "";

    if(currentMode === "change" && currentPassword === ""){
        document.getElementById("currentPasswordError").textContent = "Current password is required";
        return;
    }

    if(newPassword === ""){
        document.getElementById("newPasswordError").textContent = "New password is required";
        return;
    }

    if(newPassword.length < 8){
        document.getElementById("newPasswordError").textContent = "Password must be at least 8 characters";
        return;
    }

    if(confirmPassword === ""){
        document.getElementById("confirmPasswordError").textContent = "Please confirm your password";
        return;
    }

    if(newPassword !== confirmPassword){
        document.getElementById("confirmPasswordError").textContent = "Passwords do not match";
        return;
    }

    showStep("stepSuccess");
});

backToEmailBtn.addEventListener("click", function(){
    showStep("stepEmail");
});

backToOtpBtn.addEventListener("click", function(){
    showStep("stepOtp");
});

doneBtn.addEventListener("click", closePasswordModalHandler);