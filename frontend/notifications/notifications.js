// =========================================
// BuildTrack - Notifications
// =========================================

window.onload = function () {

    console.log("Notifications Page Loaded");

    initializeMarkAllRead();

    initializeClearAll();

};

// =========================================
// Mark All as Read
// =========================================

function initializeMarkAllRead() {

    const markBtn = document.getElementById("markAllRead");

    markBtn.addEventListener("click", function () {

        const notifications =
            document.querySelectorAll(".notification");

        notifications.forEach(function (item) {

            item.classList.remove("unread");

        });

        alert("All notifications marked as read.");

    });

}

// =========================================
// Clear All Notifications
// =========================================

function initializeClearAll() {

    const clearBtn = document.getElementById("clearAll");

    clearBtn.addEventListener("click", function () {

        const notificationList =
            document.querySelector(".notification-list");

        notificationList.innerHTML = `

            <div class="notification">

                <div class="icon primary">

                    <i class="fa-solid fa-bell-slash"></i>

                </div>

                <div class="content">

                    <h3>No Notifications</h3>

                    <p>You don't have any notifications.</p>

                    <span>Just Now</span>

                </div>

            </div>

        `;

        alert("All notifications cleared.");

    });

}

// =========================================
// Future Backend Integration
// =========================================

// async function getNotifications(){
//
// const response = await fetch(
//
// "http://localhost:5000/api/notifications"
//
// );
//
// const data = await response.json();
//
// console.log(data);
//
// }

// =========================================
// End
// =========================================