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

        // alert("Login Successful!");
        fetch("http://127.0.0.1:8000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        })
        .then(response => response.json())
        .then(data => {

            // Store JWT
            localStorage.setItem("token", data.access_token);

            alert("Login Successful!");

            console.log(data);

            // Redirect later
            // window.location.href = "../dashboard/dashboard.html";

        })
        .catch(err => {
            console.error(err);
            alert("Login Failed");
        });

    }

});