const modal = document.getElementById('assignmentModal');
const openBtn = document.getElementById('openAssignment');
const closeBtn = document.getElementById('closeModal');
const confirmBtn = document.getElementById('confirmAssignment');

if (modal && openBtn) {
  openBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });
}

if (modal && closeBtn) {
  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}

if (modal && confirmBtn) {
  confirmBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}

if (modal) {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.classList.add('hidden');
    }
  });
}
