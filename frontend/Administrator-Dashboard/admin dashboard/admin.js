// Sidebar Active Menu

const menuItems = document.querySelectorAll(".sidebar li");

menuItems.forEach(item => {

    item.addEventListener("click", () => {

        menuItems.forEach(i => i.classList.remove("active"));

        item.classList.add("active");

    });

});

// Welcome Message

console.log("Construction Project Management Dashboard Loaded Successfully");

// Fake Notification Counter

let notifications = 4;

setInterval(() => {

    document.title = `(${notifications}) Admin Dashboard`;

},1000);