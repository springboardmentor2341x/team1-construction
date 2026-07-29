const modal = document.getElementById('assignmentModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModal');
const confirmBtn = document.getElementById('confirmAssignment');

function openModal(type) {
  const title = type === 'engineer' ? 'Assign Site Engineer' : 'Assign Contractor';
  modalTitle.textContent = title;
  modalBody.textContent = `A new ${type === 'engineer' ? 'site engineer' : 'contractor'} assignment request will be sent to the field team.`;
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

document.querySelectorAll('[data-modal]').forEach((button) => {
  button.addEventListener('click', () => openModal(button.dataset.modal));
});

closeModalBtn.addEventListener('click', closeModal);
confirmBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});
