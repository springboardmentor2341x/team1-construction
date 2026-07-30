const form = document.getElementById("workForm");


form.addEventListener("submit",function(e){


    e.preventDefault();



    let project =
    document.getElementById("project").value;


    let description =
    document.getElementById("description").value;



    if(project=="" || description==""){


        alert("Please fill required details");


    }
    else{


        alert(
        "Daily Work Update Submitted Successfully"
        );


        form.reset();

    }



});