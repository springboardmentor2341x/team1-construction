<div align="center">

# 🏗️ BuildTrack — Construction Project Management System

**A full-stack role-based construction project management platform for planning, executing, and tracking construction projects.**

![Angular](https://img.shields.io/badge/Frontend-Angular%2019-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

</div>

---

## 📖 Table of Contents

- [1. Project Title](#-project-title)
- [2. Project Description](#-project-description)
- [3. Features](#-features)
- [4. Technology Stack](#-technology-stack)
- [5. Project Architecture](#-project-architecture)
- [6. Modules Implemented](#-modules-implemented)
- [7. User Roles](#-user-roles)
- [8. Database Design](#-database-design)
- [9. API Overview](#-api-overview)
- [10. Frontend Folder Structure](#-frontend-folder-structure)
- [11. Backend Folder Structure](#-backend-folder-structure)
- [12. Installation & Setup](#-installation--setup)
- [13. How to Run the Frontend](#-how-to-run-the-frontend)
- [14. How to Run the Backend](#-how-to-run-the-backend)
- [15. Screenshots](#-screenshots)

---

## 🚀 Project Title

# BuildTrack — Construction Project Management System

---

## 📝 Project Description

**BuildTrack** is a comprehensive, full-stack construction project management platform that enables construction firms to plan, assign, and monitor projects across multiple roles. It provides a **role-based access control (RBAC)** system where Administrators, Project Managers, Site Engineers, Contractors, Workers, and Clients each get tailored dashboards and permissions.

The system handles the full project lifecycle — from **project creation, scheduling, and milestone tracking**, to **personnel assignment** (engineers, contractors, clients), **project closure**, and a complete **audit trail**. Built with an **Angular 19** frontend, a **FastAPI** backend, and a **PostgreSQL** database, BuildTrack delivers a secure, production-ready baseline with a clean and modern UI.

---

## ✨ Features

### Authentication & Security
- ✅ Secure **JWT-based** authentication with bcrypt password hashing
- ✅ **Role-based access control (RBAC)** enforced on both frontend guards and backend API
- ✅ **Forgot / Reset password** flow with short-lived tokens
- ✅ **Strong password validation** (8+ chars, upper/lower/digit/special)
- ✅ **Remember Me** option (extends token lifetime to 30 days)
- ✅ Account deactivation check on login

### Project Management
- ✅ Create, view, update, close, and delete projects
- ✅ Search & filter projects by name, code, client, category, priority, and status
- ✅ **Site Engineer / Contractor / Client assignment** & unassignment
- ✅ **Project closure** with reason
- ✅ **Audit history** of every project lifecycle event
- ✅ **Milestone** tracking (planned date, actual completion, %, status)
- ✅ **Project schedules** (phases with planned start/end dates)
- ✅ **Tasks** assignment & status updates
- ✅ **Documents** management

### Workforce & Operations
- ✅ **Shift scheduling** for workers
- ✅ **Attendance** tracking with check-in/out and hours worked
- ✅ **Notifications** (read/unread, mark-all-read, categories)
- ✅ **Daily activity logs** (site engineer)
- ✅ **Equipment status** tracking
- ✅ **Analytics & executive reports**

### UI/UX
- 🎨 Modern responsive UI with **Bootstrap 5** + **Angular Material** icons
- 👤 Six role-specific dashboards
- 🧭 Role-based dynamic sidebar navigation
- 🔄 **Role Simulator** for previewing different role views

---

## 🛠 Technology Stack

### Frontend (Angular)
| Technology | Purpose |
|---|---|
| **Angular 19** | Core SPA framework |
| **Angular Router** | Client-side routing + guards |
| **Angular Forms** | Reactive/template-driven forms |
| **Bootstrap 5** | Responsive styling & layout |
| **Bootstrap Icons** | UI icons |
| **RxJS** | Reactive state & HTTP handling |
| **TypeScript** | Typed language |

### Backend (FastAPI)
| Technology | Purpose |
|---|---|
| **FastAPI** | Async Python web framework |
| **SQLAlchemy 2.0** | ORM & data models |
| **Pydantic v2** | Schema validation |
| **python-jose** | JWT encoding/decoding |
| **passlib + bcrypt** | Password hashing |
| **Uvicorn** | ASGI server |
| **Alembic** | Database migrations |

### Database (PostgreSQL)
| Technology | Purpose |
|---|---|
| **PostgreSQL** | Relational database |
| **psycopg2** | PostgreSQL driver |
| **SQLAlchemy Inspector** | Schema introspection |

---

## 🏛 Project Architecture

BuildTrack follows a **client-server architecture** with a clear separation of concerns:

```
┌──────────────────────────────┐
│        ANGULAR FRONTEND       │
│  (Components · Services ·     │
│   Guards · Interceptors)      │
└──────────┬───────────────────┘
           │  HTTP / JSON over HTTPS (REST)
           ▼
┌──────────────────────────────┐
│        FASTAPI BACKEND        │
│  (Routers → Services → Repos) │
└──────────┬───────────────────┘
           │  SQLAlchemy ORM
           ▼
┌──────────────────────────────┐
│         PostgreSQL            │
│   (Tables · FKs · Constraints)│
└──────────────────────────────┘
```

### Frontend Architecture

```
┌──────────────────────────────────────────────┐
│                  Angular App                 │
│  index.html → main.ts → AppComponent         │
│                                              │
│  ┌─────────┐   ┌──────────┐   ┌───────────┐  │
│  │ Features │──▶│  Core     │──▶│  Services  │ │
│  │ (pages)  │   │ (guards,  │   │ (HTTP API)│  │
│  │          │   │  models)  │   │           │  │
│  └─────────┘   └──────────┘   └───────────┘  │
│        │             │              │        │
│        ▼             ▼              ▼        │
│  ┌─────────┐   ┌──────────┐   ┌───────────┐  │
│  │ Shared  │   │ JWT       │   │  Backend  │  │
│  │ (navbar,│   │ Interceptor│  │  REST API │  │
│  │  sidebar)│  │ (auth)    │   │           │  │
│  └─────────┘   └──────────┘   └───────────┘  │
└──────────────────────────────────────────────┘
```

### Backend Architecture

```
┌──────────────────────────────────────────────┐
│                 FastAPI App                    │
│  main.py (app factory, CORS, startup seed)    │
│                                               │
│  Routers ──▶ Services ──▶ Repositories ──▶ ORM│
│  (auth, users, projects, schedules,           │
│   milestones, shifts, tasks, documents,       │
│   site_engineer, attendance, notifications)   │
│                                               │
│  Dependencies: get_db, get_current_user,      │
│                RequireRole (RBAC)             │
│                                               │
│  Core: config (env), security (JWT/bcrypt)    │
└──────────────────────────────────────────────┘
```

---

## 📦 Modules Implemented

### Module 1 – User Authentication & Role-Based Access Control ✅
- JWT-based secure login with bcrypt password hashing
- Role-based access control (RBAC) via `RequireRole` dependency on every write endpoint
- `get_current_user` authentication on every protected read endpoint
- Forgot / Reset password with short-lived JWT reset tokens
- Strong password validation (8+ chars, upper, lower, digit, special)
- Remember Me (30-day token)
- Frontend `authGuard` + `roleGuard` route protection
- JWT interceptor attaching bearer tokens to all requests
- Registration endpoint with duplicate email/employee-id checks

### Module 2 – Project Management System ✅
- Full project CRUD (create, read, update, delete, close)
- Search & filter projects
- Site Engineer / Contractor / Client assignment + unassignment
- Project closure with reason
- Project audit trail (`project_audit_logs`)
- Milestone tracking (create/update/delete, % completion)
- Project schedules (phases with dates)
- Tasks & documents management
- Role-restricted actions (admin/PM only for writes)

### Remaining Project Modules
| Module | Description | Status |
|---|---|---|
| **Workforce & Shifts** | Worker shift scheduling and attendance | ✅ Implemented |
| **Notifications** | User notifications with read state | ✅ Implemented |
| **Inventory & Procurement** | Material tracking and procurement | ⚠️ Placeholder models (`Inventory`, `Procurement`) |
| **Budget Management** | Financial tracking per project | ⚠️ Placeholder (`estimated_budget` on Project) |
| **Resource Management** | Shared resource availability | ⚠️ Placeholder model (`Resource`) |
| **Reports & Analytics** | Executive dashboards & reports | ✅ Implemented (frontend pages) |

---

## 👥 User Roles

| Role | Permissions & Capabilities |
|---|---|
| **Administrator** | Full system governance: create/delete projects, manage all users, view all data, system settings, project assignments |
| **Project Manager** | Create/update projects, manage schedules & milestones, assign personnel, close projects, view analytics |
| **Site Engineer** | Daily activity logs, equipment status, view assigned site projects, submit engineering reports |
| **Contractor** | Assign tasks to workers, manage contractor workforce, view shift schedules |
| **Worker** | View assigned tasks, record attendance, view personal shift schedule |
| **Client** | Read-only project progress, milestones, documents, and executive reports |

---

## 🗄 Database Design

BuildTrack uses a normalized relational schema with foreign keys, unique constraints, and cascade deletes.

### Core Tables
| Table | Purpose |
|---|---|
| `users` | User accounts (hashed passwords, role FK) |
| `roles` | Role definitions (6 roles) |
| `projects` | Project master data + PM reference |
| `project_schedules` | Schedule phases per project |
| `project_milestones` | Milestones per project |
| `project_site_engineers` | Engineer↔Project assignment (unique constraint) |
| `project_contractors` | Contractor↔Project assignment |
| `project_clients` | Client↔Project assignment |
| `contractor_workers` | Contractor↔Worker relationship |
| `project_audit_logs` | Project lifecycle audit trail |
| `tasks` | Work tasks assigned to workers |
| `documents` | Project documents |
| `shifts` | Worker shift schedules |
| `attendance` | Attendance records |
| `notifications` | User notifications |
| `activity_logs` | Daily site activity logs |
| `equipment` | Equipment status |
| `placeholders` | `resources`, `inventory`, `procurements`, `reports` |

### Key Relationships
- `users.role_id → roles.id`
- `projects.project_manager_id → users.id`
- `project_milestones.project_id → projects.id` (CASCADE)
- `project_schedules.project_id → projects.id` (CASCADE)
- `project_site_engineers.project_id → projects.id` & `site_engineer_id → users.id`
- `project_audit_logs.project_id → projects.id` (CASCADE)

---

## 🔌 API Overview

The backend exposes a REST API under `/api/v1`. Interactive docs are available at **`http://localhost:8000/docs`** (Swagger UI).

### Auth Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Login (supports remember me) | Public |
| POST | `/api/v1/auth/register` | Register new user | Public |
| POST | `/api/v1/auth/forgot-password` | Request password reset | Public |
| POST | `/api/v1/auth/reset-password` | Reset password with token | Public |
| GET | `/api/v1/auth/me` | Get current user profile | Auth |
| GET/PUT | `/api/v1/profile` | View / update own profile | Auth |

### User Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/users` | List users (filter by role) | Admin/PM/Engineer/Contractor |
| GET | `/api/v1/users/{id}` | Get user by id | Auth |
| PUT | `/api/v1/users/{id}` | Update user | Auth |
| PATCH | `/api/v1/users/{id}/status` | Activate/deactivate user | Admin |

### Project Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/projects` | List projects (search/filter) | Auth |
| POST | `/api/v1/projects` | Create project | Admin |
| GET | `/api/v1/projects/assignments` | List personnel assignments | Auth |
| GET | `/api/v1/projects/{id}` | Get project detail | Auth |
| PUT | `/api/v1/projects/{id}` | Update project | Admin/PM |
| DELETE | `/api/v1/projects/{id}` | Delete project | Admin |
| POST | `/api/v1/projects/{id}/close` | Close project | Admin/PM |
| POST | `/api/v1/projects/{id}/assign-engineer` | Assign engineer | Admin/PM |
| POST | `/api/v1/projects/{id}/assign-contractor` | Assign contractor | Admin/PM |
| POST | `/api/v1/projects/{id}/assign-client` | Assign client | Admin/PM |
| DELETE | `/api/v1/projects/{id}/unassign` | Unassign personnel | Admin/PM |
| GET | `/api/v1/projects/{id}/audit` | Get audit logs | Admin/PM |

### Schedule & Milestone Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/schedules?projectId=` | List schedules | Auth |
| POST | `/api/v1/schedules` | Create schedule | Admin/PM |
| PUT/DELETE | `/api/v1/schedules/{id}` | Update/delete schedule | Admin/PM |
| GET | `/api/v1/milestones?projectId=` | List milestones | Auth |
| POST | `/api/v1/milestones` | Create milestone | Admin/PM |
| PUT/DELETE | `/api/v1/milestones/{id}` | Update/delete milestone | Admin/PM |

### Tasks & Documents
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/tasks` | List tasks | Auth |
| POST | `/api/v1/tasks` | Create task | Admin/PM/Engineer/Contractor |
| PATCH | `/api/v1/tasks/{id}` | Update task status/progress | Auth |
| GET | `/api/v1/documents` | List documents | Auth |

### Workforce & Operations
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/v1/shifts` | List shifts | Auth |
| POST | `/api/v1/shifts` | Create shift | Admin/PM/Engineer |
| PUT/DELETE | `/api/v1/shifts/{id}` | Update/delete shift | Admin/PM/Engineer |
| GET | `/api/v1/attendance` | List attendance | Auth |
| POST | `/api/v1/attendance` | Record attendance | Auth |
| GET | `/api/v1/notifications` | List notifications | Auth |
| POST | `/api/v1/notifications` | Create notification | Admin/Engineer |
| PATCH | `/api/v1/notifications/{id}/read` | Mark notification read | Auth |
| POST | `/api/v1/notifications/read-all` | Mark all read | Auth |
| DELETE | `/api/v1/notifications` | Clear all | Admin |
| GET | `/api/v1/activity-logs` | List activity logs | Auth |
| GET | `/api/v1/equipment` | List equipment | Auth |

---

## 📂 Frontend Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/            # authGuard, roleGuard
│   │   │   ├── interceptors/      # JWT interceptor
│   │   │   ├── models/            # TS interfaces (user, project, etc.)
│   │   │   └── services/          # HTTP API services
│   │   ├── features/
│   │   │   ├── admin/             # user-management, system-settings
│   │   │   ├── auth/              # login, register, forgot/reset, profile
│   │   │   ├── dashboards/        # 6 role dashboards
│   │   │   ├── projects/          # list, create, update, detail, schedules,
│   │   │   │                      #  milestones, assignments
│   │   │   ├── project-manager/   # analytics-reports
│   │   │   ├── site-engineer/     # daily-activity-logs, equipment-status
│   │   │   ├── contractor/        # assign-task, contractor-workforce
│   │   │   ├── worker/            # my-tasks, my-attendance
│   │   │   ├── client/            # executive-report, project-documents
│   │   │   └── shared-pages/      # notifications, shift-schedule
│   │   ├── shared/
│   │   │   └── components/        # navbar, sidebar, role-simulator, status-badge
│   │   ├── app.config.ts
│   │   ├── app.routes.ts          # Central route + guard definitions
│   │   └── app.component.ts
│   ├── environments/              # environment.ts (API URL)
│   ├── index.html
│   ├── main.ts
│   └── styles.css
└── angular.json
```

---

## 📂 Backend Folder Structure

```
backend/
├── main.py                        # FastAPI app factory, CORS, startup seed/migration
├── alembic.ini
├── requirements.txt
├── alembic/                       # Migration config
└── app/
    ├── core/
    │   ├── config.py              # Env settings (secret key, DB URL, etc.)
    │   └── security.py            # JWT + bcrypt utilities
    ├── database/
    │   └── session.py             # SQLAlchemy engine, SessionLocal, Base
    ├── dependencies/
    │   ├── auth.py                # get_current_user
    │   ├── database.py            # get_db
    │   └── rbac.py                # RequireRole
    ├── models/                    # SQLAlchemy ORM models
    │   ├── user.py, role.py, project.py, schedule.py, milestone.py,
    │   ├── assignments.py, project_audit.py, task.py, document.py,
    │   ├── shift.py, activity_log.py, equipment.py, placeholders.py
    ├── schemas/                   # Pydantic schemas
    │   ├── auth.py, user.py, project.py, schedule.py, milestone.py
    ├── services/                  # Business logic
    │   ├── auth_service.py, user_service.py, project_service.py,
    │   ├── schedule_service.py, milestone_service.py
    ├── repositories/              # Data-access layer
    │   ├── user_repository.py, project_repository.py,
    │   ├── schedule_repository.py, milestone_repository.py
    └── routers/                   # API endpoints
        ├── auth.py, users.py, projects.py, schedules.py, milestones.py,
        ├── shifts.py, tasks_router.py, site_engineer.py,
        ├── attendance.py, notifications.py
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js **18+** and npm
- Python **3.10+**
- PostgreSQL **14+** (running locally or via Docker)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/buildtrack.git
cd buildtrack
```

### 2. Backend Setup
```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate
# (macOS/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend/` folder (or set system variables):

```env
DATABASE_URL=postgresql+psycopg2://postgres:yourpassword@localhost:5432/buildtrack
SECRET_KEY=your-super-secret-key-change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440   # 24 hours
PROJECT_NAME=BuildTrack
API_V1_STR=/api/v1
```

> **Note:** On the first run, the backend automatically creates all tables and seeds default roles, users, projects, and sample data.

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install
```

### 5. Configure the API URL
Update `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1'
};
```

---

## ▶️ How to Run the Frontend

```bash
cd frontend
npm start
```

The app will be served at **`http://localhost:4200`** (Angular dev server with hot-reload).

### Production Build
```bash
cd frontend
npm run build
```
The compiled output is generated in the `frontend/dist/frontend/` folder.

---

## ▶️ How to Run the Backend

```bash
cd backend
venv\Scripts\activate        # (Windows)
uvicorn main:app --reload
```

The API will be available at:
- **API base:** `http://localhost:8000/api/v1`
- **Swagger UI:** `http://localhost:8000/docs`
- **Health check:** `http://localhost:8000/health`
- **Root:** `http://localhost:8000/`

### Default Seed Accounts
| Role | Email | Password |
|---|---|---|
| Administrator | `admin@buildtrack.com` | `Admin@1234` |
| Project Manager | `pm@buildtrack.com` | `Admin@1234` |
| Site Engineer | `engineer@buildtrack.com` | `Admin@1234` |
| Contractor | `contractor@buildtrack.com` | `Admin@1234` |
| Worker | `worker@buildtrack.com` | `Admin@1234` |
| Client | `client@buildtrack.com` | `Admin@1234` |

---

## 📸 Screenshots

> **⚠️ Note:** No screenshots currently exist in the repository. The placeholders below reference the recommended folder **`docs/screenshots/`**. Save each image there with the exact filename shown so the README displays them correctly.

| # | Screenshot | Image Path |
|---|---|---|
| 1 | Login Page | `docs/screenshots/login.png` |
| 2 | Registration Page | `docs/screenshots/register.png` |
| 3 | Forgot Password | `docs/screenshots/forgot-password.png` |
| 4 | Administrator Dashboard | `docs/screenshots/admin-dashboard.png` |
| 5 | Project Manager Dashboard | `docs/screenshots/pm-dashboard.png` |
| 6 | Site Engineer Dashboard | `docs/screenshots/engineer-dashboard.png` |
| 7 | Contractor Dashboard | `docs/screenshots/contractor-dashboard.png` |
| 8 | Worker Dashboard | `docs/screenshots/worker-dashboard.png` |
| 9 | Client Dashboard | `docs/screenshots/client-dashboard.png` |
| 10 | Project List | `docs/screenshots/project-list.png` |
| 11 | Project Details | `docs/screenshots/project-details.png` |
| 12 | Project Milestones | `docs/screenshots/project-milestones.png` |
| 13 | Project Assignments | `docs/screenshots/project-assignments.png` |
| 14 | Project Closure | `docs/screenshots/project-closure.png` |
| 15 | Project Audit History | `docs/screenshots/project-audit.png` |
| 16 | Attendance | `docs/screenshots/attendance.png` |
| 17 | Notifications | `docs/screenshots/notifications.png` |
| 18 | Database ER Diagram | `docs/screenshots/db-er-diagram.png` |
| 19 | Backend API (Swagger) | `docs/screenshots/swagger-api.png` |
| 20 | Folder Structure | `docs/screenshots/folder-structure.png` |
| 21 | Analytics / Reports | `docs/screenshots/analytics-reports.png` |

### Page Screenshots

**Login Page**
![Login Page](docs/screenshots/login.png)

**Registration Page**
![Registration Page](docs/screenshots/register.png)

**Forgot Password**
![Forgot Password](docs/screenshots/forgot-password.png)

**Administrator Dashboard**
![Administrator Dashboard](docs/screenshots/admin-dashboard.png)

**Project Manager Dashboard**
![Project Manager Dashboard](docs/screenshots/pm-dashboard.png)

**Site Engineer Dashboard**
![Site Engineer Dashboard](docs/screenshots/engineer-dashboard.png)

**Contractor Dashboard**
![Contractor Dashboard](docs/screenshots/contractor-dashboard.png)

**Worker Dashboard**
![Worker Dashboard](docs/screenshots/worker-dashboard.png)

**Client Dashboard**
![Client Dashboard](docs/screenshots/client-dashboard.png)

**Project List**
![Project List](docs/screenshots/project-list.png)

**Project Details**
![Project Details](docs/screenshots/project-details.png)

**Project Milestones**
![Project Milestones](docs/screenshots/project-milestones.png)

**Project Assignments**
![Project Assignments](docs/screenshots/project-assignments.png)

**Project Closure**
![Project Closure](docs/screenshots/project-closure.png)

**Project Audit History**
![Project Audit History](docs/screenshots/project-audit.png)

**Attendance**
![Attendance](docs/screenshots/attendance.png)

**Notifications**
![Notifications](docs/screenshots/notifications.png)

### Database & Backend

**Database ER Diagram**
![Database ER Diagram](docs/screenshots/db-er-diagram.png)

> *If you don't have an ER diagram, you can generate one with tools like [dbdiagram.io](https://dbdiagram.io) or pgAdmin's ERD tool.*

**Backend API — Swagger/OpenAPI**
![Backend API Swagger](docs/screenshots/swagger-api.png)

> *Available live at `http://localhost:8000/docs`. Capture a screenshot of the Swagger UI.*

**Folder Structure**
![Folder Structure](docs/screenshots/folder-structure.png)

### Architecture Diagrams

**Analytics / Reports**
![Analytics Reports](docs/screenshots/analytics-reports.png)

> ⚠️ **Frontend & Backend architecture diagrams:** Inline diagrams are already provided in the [Project Architecture](#-project-architecture) section using ASCII art. If you prefer image-based diagrams, save them to `docs/screenshots/frontend-architecture.png` and `docs/screenshots/backend-architecture.png` and reference them below.

**Frontend Architecture Diagram**
![Frontend Architecture](docs/screenshots/frontend-architecture.png)

**Backend Architecture Diagram**
![Backend Architecture](docs/screenshots/backend-architecture.png)

---

## 📋 Which Screenshots to Capture & Where to Save Them

To make all images appear correctly in the README, **capture the following pages** and save them into the **`docs/screenshots/`** folder at the **project root** with these exact filenames:

### How to capture
1. Run the backend (`uvicorn main:app --reload`).
2. Run the frontend (`npm start`).
3. Open `http://localhost:4200` and log in with a role account.
4. Navigate to each page below and take a screenshot (e.g., `Snip & Sketch`, `Windows+Shift+S`, or browser DevTools).

| File to Save | What to Capture |
|---|---|
| `login.png` | Open `http://localhost:4200/login` |
| `register.png` | Click "Register" on the login page |
| `forgot-password.png` | Click "Forgot Password" on the login page |
| `admin-dashboard.png` | Log in as `admin@buildtrack.com` → Admin Dashboard |
| `pm-dashboard.png` | Log in as `pm@buildtrack.com` → PM Dashboard |
| `engineer-dashboard.png` | Log in as `engineer@buildtrack.com` → Site Engineer Dashboard |
| `contractor-dashboard.png` | Log in as `contractor@buildtrack.com` → Contractor Dashboard |
| `worker-dashboard.png` | Log in as `worker@buildtrack.com` → Worker Dashboard |
| `client-dashboard.png` | Log in as `client@buildtrack.com` → Client Dashboard |
| `project-list.png` | Admin → "Project Directory" |
| `project-details.png` | Click any project in the list |
| `project-milestones.png` | PM → "Milestone Tracker" |
| `project-assignments.png` | Admin/PM → "Project Assignments" |
| `project-closure.png` | Assignments page → "Project Closure" card |
| `project-audit.png` | Assignments page → "Audit History" card |
| `attendance.png` | Worker → "My Attendance" |
| `notifications.png` | Any role → "Notifications" |
| `db-er-diagram.png` | Generate ERD from pgAdmin / dbdiagram.io |
| `swagger-api.png` | Open `http://localhost:8000/docs` |
| `folder-structure.png` | Screenshot of the project tree in VS Code |
| `analytics-reports.png` | PM → "Analytics & Reports" |
| `frontend-architecture.png` | *(Optional)* Diagram image |
| `backend-architecture.png` | *(Optional)* Diagram image |

### Directory to create
```
docs/
└── screenshots/
    ├── login.png
    ├── register.png
    ├── forgot-password.png
    ├── admin-dashboard.png
    ├── pm-dashboard.png
    ├── engineer-dashboard.png
    ├── contractor-dashboard.png
    ├── worker-dashboard.png
    ├── client-dashboard.png
    ├── project-list.png
    ├── project-details.png
    ├── project-milestones.png
    ├── project-assignments.png
    ├── project-closure.png
    ├── project-audit.png
    ├── attendance.png
    ├── notifications.png
    ├── db-er-diagram.png
    ├── swagger-api.png
    ├── folder-structure.png
    └── analytics-reports.png
```

---

## 🙏 Acknowledgements

- [Angular](https://angular.io/) — Web application framework
- [FastAPI](https://fastapi.tiangolo.com/) — Backend framework
- [PostgreSQL](https://www.postgresql.org/) — Database
- [Bootstrap](https://getbootstrap.com/) & [Bootstrap Icons](https://icons.getbootstrap.com/) — UI styling

---

<div align="center">

Made with ❤️ by the **BuildTrack** team

</div>
