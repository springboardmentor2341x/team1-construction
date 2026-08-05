// ================================
// Common Theme Manager
// ================================

// Apply saved theme when page loads

document.addEventListener("DOMContentLoaded", function(){

    const savedTheme = localStorage.getItem("theme");

    if(savedTheme==="dark"){

        document.body.classList.add("dark-theme");

    }

});


// Function to change theme

function changeTheme(theme){

    if(theme==="dark"){

        document.body.classList.add("dark-theme");

    }

    else{

        document.body.classList.remove("dark-theme");

    }

    localStorage.setItem("theme",theme);

}


// Automatically connect Theme dropdown

const themeSelect=document.getElementById("themeSelect");

if(themeSelect){

    const savedTheme=localStorage.getItem("theme") || "light";

    themeSelect.value=savedTheme;

    themeSelect.addEventListener("change",function(){

        changeTheme(this.value);

    });

}