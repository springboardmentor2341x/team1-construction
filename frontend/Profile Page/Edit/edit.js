const profileForm = document.getElementById("profileForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const dobInput = document.getElementById("dob");
const genderInput = document.getElementById("gender");
const profileForm = document.getElementById("profileForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const dobInput = document.getElementById("dob");
const genderInput = document.getElementById("gender");
const departmentInput = document.getElementById("department");
const addressInput = document.getElementById("address");
const profileForm = document.getElementById("profileForm");

const photoFileInput = document.getElementById("photoFile");
const photoPreview = document.getElementById("photoPreview");
let selectedPhotoDataUrl = null;
const nameInput = document.getElementById("name");
const roleInput = document.getElementById("role");
const employeeIdInput = document.getElementById("employeeId");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const addressInput = document.getElementById("address");
const roleDetail1Input = document.getElementById("roleDetail1");
const roleDetail2Input = document.getElementById("roleDetail2");

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
    employeeIdInput.value = profileData.userId || profileData.employeeId || "";
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
        userId: employeeIdInput.value,
        employeeId: employeeIdInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        address: addressInput.value,
        roleDetail1: roleDetail1Input.value,
        roleDetail2: roleDetail2Input.value
    });

    setTimeout(()=>{
        localStorage.setItem('profile', JSON.stringify(profileData));
        hideLoader();
        showToast('Profile Updated Successfully');
        setTimeout(()=>{ window.location.href = '../Profile.html'; }, 800);
    }, 600);
});

function showToast(message){
    if(!toast) return;
    toast.innerText = message || 'Saved';
    toast.classList.add('show');
    setTimeout(()=> toast.classList.remove('show'), 2500);
}

function showLoader(){ if(loader) loader.classList.add('active'); }
function hideLoader(){ if(loader) loader.classList.remove('active'); }