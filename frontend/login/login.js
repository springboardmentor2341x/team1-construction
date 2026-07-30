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