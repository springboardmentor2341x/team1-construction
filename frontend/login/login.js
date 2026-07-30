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

            if (data.access_token) {
                // Store JWT token
                localStorage.setItem("token", data.access_token);

                // Store basic profile info from login response
                const profile = {
                    name: data.full_name,
                    role: data.role,
                    email: email
                };
                localStorage.setItem("profile", JSON.stringify(profile));

                alert("Login Successful!");

                console.log(data);

                // Redirect to profile page
                window.location.href = "../Profile Page/Profile.html";
            } else {
                alert("Login Failed: " + (data.detail || "Unknown error"));
            }

        })
        .catch(err => {
            console.error(err);
            alert("Login Failed - Cannot connect to backend server. Make sure uvicorn is running on port 8000.");
        });

    }

});
