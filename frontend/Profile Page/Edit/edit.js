const profileForm = document.getElementById("profileForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const departmentInput = document.getElementById("department");
const addressInput = document.getElementById("address");
const roleInput = document.getElementById("role");
const employeeIdInput = document.getElementById("employeeId");
const roleDetail1Input = document.getElementById("roleDetail1");
const roleDetail2Input = document.getElementById("roleDetail2");

const photoFileInput = document.getElementById("photoFile");
const photoPreview = document.getElementById("photoPreview");
let selectedPhotoDataUrl = null;

const toast = document.getElementById("toast");
const loader = document.getElementById("loader");

window.addEventListener('load', ()=>{
    const profileData = JSON.parse(localStorage.getItem("profile")) || {};

    if(profileData.photo){
        if(photoPreview){ photoPreview.src = profileData.photo; photoPreview.style.display = 'block'; }
        selectedPhotoDataUrl = profileData.photo;
    }
    nameInput.value = profileData.name || "";
    roleInput.value = profileData.role || profileData.department || "Project Manager";
    employeeIdInput.value = profileData.employeeId || profileData.userId || "";
    emailInput.value = profileData.email || "";
    phoneInput.value = profileData.phone || "";
    addressInput.value = profileData.address || "";
    roleDetail1Input.value = profileData.roleDetail1 || "";
    roleDetail2Input.value = profileData.roleDetail2 || "";
});

if(photoFileInput){
    photoFileInput.addEventListener('change', (ev)=>{
        const f = ev.target.files && ev.target.files[0];
        if(!f) return;
        const reader = new FileReader();
        reader.onload = () => {
            selectedPhotoDataUrl = reader.result;
            if(photoPreview){ photoPreview.src = selectedPhotoDataUrl; photoPreview.style.display = 'block'; }
        };
        reader.readAsDataURL(f);
    });
}

profileForm.addEventListener('submit', (e)=>{
    e.preventDefault();

    showLoader();

    const existing = JSON.parse(localStorage.getItem('profile')) || {};

    const profileData = Object.assign({}, existing, {
        photo: selectedPhotoDataUrl || existing.photo,
        name: nameInput.value,
        role: roleInput.value,
        employeeId: employeeIdInput.value,
        userId: employeeIdInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        address: addressInput.value,
        roleDetail1: roleDetail1Input.value,
        roleDetail2: roleDetail2Input.value
    });

    // Save to backend API
    const token = localStorage.getItem("token");
    if (token) {
        fetch("http://127.0.0.1:8000/auth/profile", {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                full_name: nameInput.value,
                mobile: phoneInput.value,
                address: addressInput.value,
                department: roleDetail1Input.value || roleInput.value
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Profile saved to backend:", data);
            // Update profile in localStorage with fresh data from backend
            profileData.name = data.name || profileData.name;
            profileData.phone = data.mobile || profileData.phone;
            profileData.address = data.address || profileData.address;
            profileData.department = data.department || profileData.department;
            localStorage.setItem('profile', JSON.stringify(profileData));
            hideLoader();
            showToast('Profile Updated Successfully');
            setTimeout(()=>{ window.location.href = '../Profile.html'; }, 800);
        })
        .catch(err => {
            console.error("Backend save failed, saving locally:", err);
            localStorage.setItem('profile', JSON.stringify(profileData));
            hideLoader();
            showToast('Profile Updated Locally');
            setTimeout(()=>{ window.location.href = '../Profile.html'; }, 800);
        });
    } else {
        // No token, just save locally
        localStorage.setItem('profile', JSON.stringify(profileData));
        hideLoader();
        showToast('Profile Updated Successfully');
        setTimeout(()=>{ window.location.href = '../Profile.html'; }, 800);
    }
});

function showToast(message){
    if(!toast) return;
    toast.innerText = message || 'Saved';
    toast.classList.add('show');
    setTimeout(()=> toast.classList.remove('show'), 2500);
}

function showLoader(){ if(loader) loader.classList.add('active'); }
function hideLoader(){ if(loader) loader.classList.remove('active'); }
