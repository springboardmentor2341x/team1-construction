const modal = document.getElementById('assignmentModal');
const openBtn = document.getElementById('openAssignment');
const closeBtn = document.getElementById('closeModal');
const confirmBtn = document.getElementById('confirmAssignment');
const navLinks = document.querySelectorAll('.nav-links a');
const pageTitle = document.getElementById('pageTitle');
const pageDescription = document.getElementById('pageDescription');
const pageSections = document.querySelectorAll('.page-section');

const pageContent = {
  dashboard: {
    title: 'Manage your assigned work with clarity',
    description: 'Track site activity, workers, materials, and daily progress from one place.',
    stats: [
      { label: 'Active Sites', value: '--', meta: 'Waiting for backend data' },
      { label: 'Pending Tasks', value: '--', meta: 'Waiting for backend data' },
      { label: 'Material Requests', value: '--', meta: 'Waiting for backend data' },
      { label: 'Work Status', value: '--', meta: 'Waiting for backend data' }
    ],
    cards: [
      { eyebrow: 'Project Summary', title: 'Assigned projects', body: 'The dashboard will populate once the API returns project data.' },
      { eyebrow: 'Task Management', title: 'Daily work list', body: 'Daily tasks will be rendered here from backend data.' }
    ]
  },
  'assigned-projects': {
    title: 'Assigned Projects',
    description: 'Review all active construction sites and their current progress.',
    cards: [
      { eyebrow: 'Projects', title: 'Site list', body: 'Assigned site records will appear here once backend data is available.', items: ['Project name', 'Status', 'Last update'] }
    ]
  },
  'assigned-workers': {
    title: 'Assigned Workers',
    description: 'Monitor team presence, task allocation, and workforce availability.',
    cards: [
      { eyebrow: 'Workers', title: 'Team board', body: 'Worker details will be rendered from the backend.', items: ['Name', 'Role', 'Shift'] }
    ]
  },
  'daily-work-status': {
    title: 'Daily Work Status',
    description: 'Capture daily progress, onsite blockers, and completed work items.',
    cards: [
      { eyebrow: 'Daily Work', title: 'Progress log', body: 'Daily updates will be loaded from the backend.', items: ['Task', 'Progress', 'Notes'] }
    ]
  },
  'material-requests': {
    title: 'Material Requests',
    description: 'Keep track of supply needs, approvals, and stock updates.',
    cards: [
      { eyebrow: 'Materials', title: 'Request board', body: 'Material requests will be shown here when the API is ready.', items: ['Item', 'Quantity', 'Status'] }
    ]
  },
  reports: {
    title: 'Reports',
    description: 'View daily reports, progress summaries, and productivity insights.',
    cards: [
      { eyebrow: 'Reports', title: 'Site reports', body: 'Report data will be rendered once the backend responds.', items: ['Report title', 'Generated on', 'Status'] }
    ]
  },
  notifications: {
    title: 'Notifications',
    description: 'Stay updated with alerts, reminders, and important site messages.',
    cards: [
      { eyebrow: 'Notifications', title: 'Inbox', body: 'Notification items will appear here when backend data is available.', items: ['Message', 'Type', 'Priority'] }
    ]
  },
  profile: {
    title: 'Profile',
    description: 'Manage your contractor profile and communication preferences.',
    cards: [
      { eyebrow: 'Profile', title: 'Account details', body: 'Profile values will be displayed once the API sends them.', items: ['Field', 'Value', 'Last updated'] }
    ]
  }
};

function createStatCard(item) {
  const article = document.createElement('article');
  article.className = 'stat-card';
  article.innerHTML = `
    <p>${item.label}</p>
    <h3>${item.value}</h3>
    <span>${item.meta}</span>
  `;
  return article;
}

function createCardBlock(block) {
  const article = document.createElement('article');
  article.className = 'card';
  article.innerHTML = `
    <div class="card-head">
      <div>
        <p class="eyebrow">${block.eyebrow}</p>
        <h3>${block.title}</h3>
      </div>
      <span class="placeholder-pill">Awaiting backend</span>
    </div>
    <p class="empty-state">${block.body}</p>
    ${block.items ? `<ul class="detail-list">${block.items.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}
  `;
  return article;
}

function renderPage(page) {
  const selectedPage = pageContent[page] || pageContent.dashboard;
  const statsContainer = document.getElementById(`${page}-stats`);
  const cardsContainer = document.getElementById(`${page}-cards`);

  if (statsContainer) {
    statsContainer.innerHTML = '';
    selectedPage.stats?.forEach((item) => {
      statsContainer.appendChild(createStatCard(item));
    });
  }

  if (cardsContainer) {
    cardsContainer.innerHTML = '';
    selectedPage.cards?.forEach((card) => {
      cardsContainer.appendChild(createCardBlock(card));
    });
  }

  pageTitle.textContent = selectedPage.title;
  pageDescription.textContent = selectedPage.description;
}

function setActivePage(page) {
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.dataset.page === page);
  });

  pageSections.forEach((section) => {
    section.classList.toggle('hidden', section.id !== `${page}-view`);
  });

  renderPage(page);
}

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

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    setActivePage(link.dataset.page);
  });
});

setActivePage('dashboard');
