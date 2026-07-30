function openForm(){

    document.getElementById("assignForm")
    .style.display="block";

}





function assignProject(){


let projectName =
document.getElementById("projectName").value;


let location =
document.getElementById("location").value;


let contractor =
document.getElementById("contractor").value;



if(projectName=="" || location=="" || contractor==""){

    alert("Please fill all details");

}
else{

    alert(
    "Project Assigned Successfully\n"+
    projectName
    );


    document.getElementById("assignForm")
    .style.display="none";

}


}