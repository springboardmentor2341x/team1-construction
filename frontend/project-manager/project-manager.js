const modal = document.getElementById('assignmentModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModal');
const confirmBtn = document.getElementById('confirmAssignment');
const navLinks = document.querySelectorAll('.nav-links a');
const pageTitle = document.getElementById('pageTitle');
const pageDescription = document.getElementById('pageDescription');
const pageSections = document.querySelectorAll('.page-section');

const pageContent = {
  dashboard: {
    title: 'Project manager workspace',
    description: 'Use this area to track project activity and upcoming work items.',
    stats: [
      { label: 'Active Projects', value: '--', meta: 'Waiting for backend data' },
      { label: 'Pending Tasks', value: '--', meta: 'Waiting for backend data' },
      { label: 'Assigned Workers', value: '--', meta: 'Waiting for backend data' },
      { label: 'Budget Status', value: '--', meta: 'Waiting for backend data' }
    ],
    cards: [
      { eyebrow: 'Project Summary', title: 'Overview', body: 'The dashboard will populate with backend data once the API is connected.' },
      { eyebrow: 'Task Management', title: 'Upcoming work', body: 'Task cards will render here when data becomes available.' }
    ]
  },
  'my-projects': {
    title: 'My Projects',
    description: 'Review project progress, milestones, and current priorities in one place.',
    cards: [
      { eyebrow: 'Projects', title: 'Project list', body: 'Project data will appear here from the backend.', items: ['Project name', 'Status', 'Last updated'] }
    ]
  },
  'project-milestones': {
    title: 'Project Milestones',
    description: 'Keep an eye on upcoming deliveries, approvals, and construction checkpoints.',
    cards: [
      { eyebrow: 'Milestones', title: 'Checkpoint list', body: 'Milestone entries will be loaded from the backend.', items: ['Milestone title', 'Target date', 'Status'] }
    ]
  },
  'site-progress': {
    title: 'Site Progress',
    description: 'Monitor field execution, site readiness, and daily construction updates.',
    cards: [
      { eyebrow: 'Site Progress', title: 'Daily updates', body: 'Site activity will be shown once the backend sends it.', items: ['Site update', 'Progress value', 'Comment'] }
    ]
  },
  'resource-allocation': {
    title: 'Resource Allocation',
    description: 'Track labor, materials, and equipment distribution across active sites.',
    cards: [
      { eyebrow: 'Resources', title: 'Allocation overview', body: 'Resource data will be bound to this section automatically.', items: ['Resource type', 'Assigned quantity', 'Availability'] }
    ]
  },
  workforce: {
    title: 'Workforce',
    description: 'Manage team availability, contractor shifts, and workforce distribution.',
    cards: [
      { eyebrow: 'Workforce', title: 'Team list', body: 'Worker data will be rendered from the backend.', items: ['Name', 'Role', 'Shift'] }
    ]
  },
  'procurement-requests': {
    title: 'Procurement Requests',
    description: 'Follow purchase orders, vendor quotes, and procurement approvals.',
    cards: [
      { eyebrow: 'Procurement', title: 'Request board', body: 'Procurement entries will appear here when the API is ready.', items: ['Request ID', 'Vendor', 'Status'] }
    ]
  },
  'budget-tracking': {
    title: 'Budget Tracking',
    description: 'Compare planned versus actual spending and monitor financial health.',
    cards: [
      { eyebrow: 'Budget', title: 'Financial overview', body: 'Budget details will be populated by backend data.', items: ['Category', 'Planned', 'Actual'] }
    ]
  },
  reports: {
    title: 'Reports',
    description: 'Access summaries for progress, procurement, budget, and safety insights.',
    cards: [
      { eyebrow: 'Reports', title: 'Report list', body: 'Report entries will be loaded from the backend.', items: ['Report name', 'Generated on', 'Status'] }
    ]
  },
  notifications: {
    title: 'Notifications',
    description: 'Stay updated with alerts, approvals, and important project messages.',
    cards: [
      { eyebrow: 'Notifications', title: 'Inbox', body: 'Notifications will render here as soon as backend data is available.', items: ['Message', 'Timestamp', 'Priority'] }
    ]
  },
  profile: {
    title: 'Profile',
    description: 'Manage your account details, role settings, and notification preferences.',
    cards: [
      { eyebrow: 'Profile', title: 'Account section', body: 'Profile details will be displayed once the API responds.', items: ['Field name', 'Value', 'Updated on'] }
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

function openModal(type) {
  const title = type === 'engineer' ? 'Assign Site Engineer' : 'Assign Contractor';
  modalTitle.textContent = title;
  modalBody.textContent = `A new ${type === 'engineer' ? 'site engineer' : 'contractor'} assignment request will be sent to the field team.`;
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
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

document.querySelectorAll('[data-modal]').forEach((button) => {
  button.addEventListener('click', () => openModal(button.dataset.modal));
});

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    setActivePage(link.dataset.page);
  });
});

closeModalBtn.addEventListener('click', closeModal);
confirmBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

setActivePage('dashboard');
