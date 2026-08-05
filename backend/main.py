import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.models.role import Role
from app.models.user import User
from app.models.project import Project
from app.models.schedule import ProjectSchedule
from app.models.milestone import ProjectMilestone
from app.models.assignments import ProjectSiteEngineer, ProjectContractor, ContractorWorker, ProjectClient
from app.models.placeholders import Resource, Inventory, Attendance, Procurement, Notification, Report
from app.models.activity_log import ActivityLogModel
from app.models.equipment import EquipmentModel
from app.models.task import TaskModel
from app.models.document import DocumentModel
from app.models.shift import ShiftModel
from app.core.security import get_password_hash

from app.routers import auth, users, projects, schedules, milestones, site_engineer, tasks_router, attendance, notifications, shifts

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration for Angular frontend
# NOTE: allow_credentials must be False here. The app uses Bearer tokens (not
# cookies), and combining allow_credentials=True with allow_origins=["*"] makes
# the browser reject every CORS response (a wildcard origin is not allowed with
# credentialed CORS). This was the root cause of "The server is not reachable"
# even when the backend was running.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(auth.profile_router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(schedules.router, prefix=settings.API_V1_STR)
app.include_router(milestones.router, prefix=settings.API_V1_STR)
app.include_router(site_engineer.router, prefix=settings.API_V1_STR)
app.include_router(tasks_router.tasks_router, prefix=settings.API_V1_STR)
app.include_router(tasks_router.documents_router, prefix=settings.API_V1_STR)
app.include_router(attendance.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(shifts.router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def startup_event():
    try:
        # Create all tables on startup if PostgreSQL is active
        Base.metadata.create_all(bind=engine)
        # Lightweight migration: add missing columns to existing tables
        # (create_all does not alter existing tables, so we add schema columns
        #  that were introduced after the initial table creation).
        ensure_columns()
        seed_database()
    except Exception as e:
        print(f"[Warning] Database startup initialization notice: {e}")


def ensure_columns():
    """Reconcile placeholder tables (attendance, notifications) with their models.

    The existing tables may have been created with an older, smaller schema that
    is missing columns the models now reference (e.g. attendance.day_name,
    notifications.notification_type). Because these are demo/seed tables whose
    data is re-populated by seed_database(), we drop and recreate them to match
    the models exactly. This prevents "UndefinedColumn" errors on every startup.
    """
    from sqlalchemy import text
    db = SessionLocal()
    try:
        # Drop the stale tables so they can be recreated to match the models.
        db.execute(text("DROP TABLE IF EXISTS attendance"))
        db.execute(text("DROP TABLE IF EXISTS notifications"))
        db.commit()
        db.close()

        # Recreate using SQLAlchemy metadata (matches the model definitions).
        from app.database.session import engine
        from app.models.placeholders import Attendance, Notification  # noqa: F401
        Base.metadata.create_all(bind=engine, tables=[Attendance.__table__, Notification.__table__])
        print("[Migration] Recreated attendance & notifications tables to match models.")
    except Exception as e:
        print(f"[Warning] Column migration notice: {e}")
    finally:
        try:
            db.close()
        except Exception:
            pass


def seed_database():
    db: Session = SessionLocal()
    try:
        # 1. Seed Roles
        roles_data = [
            ("Administrator", "Full system executive governance"),
            ("Project Manager", "Project scheduling & site management"),
            ("Site Engineer", "Daily site logs & engineering inspections"),
            ("Contractor", "Subcontractor crew & task execution"),
            ("Worker", "Field labor & attendance clock-in"),
            ("Client", "Read-only project progress oversight")
        ]

        role_map = {}
        for role_name, desc in roles_data:
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                role = Role(name=role_name, description=desc)
                db.add(role)
                db.commit()
                db.refresh(role)
            role_map[role_name] = role

        # 2. Seed Default Personnel Accounts for each role
        users_seed = [
            ("Alex Vance", "admin@buildtrack.com", "Administrator", "ADM-1001", "Executive Management"),
            ("Sarah Jenkins", "pm@buildtrack.com", "Project Manager", "PM-2004", "Project Operations"),
            ("David Miller", "engineer@buildtrack.com", "Site Engineer", "ENG-3012", "Civil Engineering"),
            ("Marcus Brody", "contractor@buildtrack.com", "Contractor", "CON-4022", "Structural Contracting"),
            ("Robert Thorne", "worker@buildtrack.com", "Worker", "WRK-5099", "Masonry & Steel"),
            ("Apex Real Estate", "client@buildtrack.com", "Client", "CLI-9001", "Client Representative")
        ]

        pm_user_id = None
        for name, email, r_name, emp_id, dept in users_seed:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    full_name=name,
                    email=email,
                    mobile="+1 555-0199",
                    password_hash=get_password_hash("Admin@1234"),
                    employee_id=emp_id,
                    department=dept,
                    designation=r_name,
                    role_id=role_map[r_name].id,
                    profile_picture="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            if r_name == "Project Manager":
                pm_user_id = user.id

        # 3. Seed Projects safely
        projects_seed = [
            {
                "project_name": "Skyline Metropolis Tower",
                "project_code": "BT-PRJ-2026-01",
                "category": "Commercial High-Rise",
                "client_name": "Apex Real Estate Holdings",
                "client_contact": "+1 (555) 014-7000",
                "description": "45-story commercial office tower featuring smart climate control.",
                "location": "742 Executive Parkway, Downtown District",
                "estimated_budget": 45000000.0,
                "priority": "High",
                "status": "In Progress",
                "start_date": "2026-01-15",
                "expected_completion_date": "2027-11-30"
            },
            {
                "project_name": "Harbor Bridge Expansion",
                "project_code": "BT-PRJ-2026-02",
                "category": "Infrastructure",
                "client_name": "Department of Transportation",
                "client_contact": "+1 (555) 019-3322",
                "description": "Six-lane marine cable-stayed bridge widening project.",
                "location": "Harbor Transit Corridor, Bay Area",
                "estimated_budget": 120000000.0,
                "priority": "High",
                "status": "In Progress",
                "start_date": "2026-03-01",
                "expected_completion_date": "2028-06-30"
            }
        ]

        for pdata in projects_seed:
            proj = db.query(Project).filter(Project.project_code == pdata["project_code"]).first()
            if not proj:
                proj = Project(
                    project_name=pdata["project_name"],
                    project_code=pdata["project_code"],
                    category=pdata["category"],
                    client_name=pdata["client_name"],
                    client_contact=pdata["client_contact"],
                    description=pdata["description"],
                    location=pdata["location"],
                    estimated_budget=pdata["estimated_budget"],
                    priority=pdata["priority"],
                    status=pdata["status"],
                    start_date=pdata["start_date"],
                    expected_completion_date=pdata["expected_completion_date"],
                    project_manager_id=pm_user_id
                )
                db.add(proj)
                db.commit()

        # 4. Seed Daily Activity Logs in PostgreSQL
        if db.query(ActivityLogModel).count() == 0:
            al1 = ActivityLogModel(
                date="2026-08-03",
                location="Block A – Basement Level 2",
                activity="Concrete pouring for columns B7 through B14. Rebar inspection completed by structural team.",
                progress_notes="68% of columns complete. Curing compound applied.",
                weather_condition="Cloudy",
                workers_present=42,
                issues="Minor delay due to pump truck maintenance (2 hrs).",
                submitted_by="David Miller",
                status="Approved"
            )
            al2 = ActivityLogModel(
                date="2026-08-02",
                location="Foundation Pit – Grid C/D",
                activity="Pile cap formwork installation and rebar cage lowering into pile caps.",
                progress_notes="All 12 pile caps on grid C prepped.",
                weather_condition="Sunny",
                workers_present=58,
                issues="None",
                submitted_by="David Miller",
                status="Approved"
            )
            al3 = ActivityLogModel(
                date="2026-08-01",
                location="Site Office & Perimeter",
                activity="Safety audit walkthrough. Updated site hazard signage. First-aid kits restocked.",
                progress_notes="All fire extinguishers checked.",
                weather_condition="Sunny",
                workers_present=10,
                issues="None",
                submitted_by="David Miller",
                status="Pending"
            )
            db.add_all([al1, al2, al3])
            db.commit()

        # 5. Seed Equipment Status in PostgreSQL
        if db.query(EquipmentModel).count() == 0:
            e1 = EquipmentModel(name="Tower Crane TC-480", type="Lifting Equipment", serial_no="TC-480-A21", location="Block A – Floor 22+", operator="James Watson", status="Operational", last_inspection="2026-07-28", next_service="2026-09-01", fuel_level=None)
            e2 = EquipmentModel(name="Concrete Pump Truck CP-8", type="Heavy Machinery", serial_no="CP8-B2026", location="Basement Zone C", operator="Mike Torres", status="Operational", last_inspection="2026-07-30", next_service="2026-08-15", fuel_level=72)
            e3 = EquipmentModel(name="Excavator CAT 390F", type="Heavy Machinery", serial_no="CAT390F-3304", location="Foundation Pit", operator="Unassigned", status="Under Maintenance", last_inspection="2026-07-15", next_service="2026-08-05", fuel_level=45)
            db.add_all([e1, e2, e3])
            db.commit()

        # 6. Seed Tasks in PostgreSQL
        if db.query(TaskModel).count() == 0:
            t1 = TaskModel(title="Install rebar grid – Level 5 East Wing", description="Complete Grade 60 rebar installation on Level 5 east perimeter.", project="Skyline Tower", assigned_to="Robert Thorne", priority="High", status="In Progress", due_date="2026-08-05", location="Block A – Level 5")
            t2 = TaskModel(title="Waterproofing Basement B2", description="Apply membrane waterproofing on all B2 walls.", project="Skyline Tower", assigned_to="Carlos Mendez", priority="High", status="Open", due_date="2026-08-08", location="Basement B2")
            db.add_all([t1, t2])
            db.commit()

        # 7. Seed Documents in PostgreSQL
        if db.query(DocumentModel).count() == 0:
            d1 = DocumentModel(name="Structural Foundation Drawings – Rev C", type="PDF", project="Skyline Tower", uploaded_by="David Miller", upload_date="2026-07-20", size="18.4 MB", category="Engineering Drawing")
            d2 = DocumentModel(name="Q2 2026 Construction Progress Report", type="PDF", project="Skyline Tower", uploaded_by="Sarah Jenkins", upload_date="2026-07-31", size="4.2 MB", category="Progress Report")
            db.add_all([d1, d2])
            db.commit()

        # 8. Seed Attendance Records
        if db.query(Attendance).count() == 0:
            att = [
                Attendance(user_id="", user_name="Robert Thorne", date="2026-08-03", day_name="Monday", shift_type="Morning", check_in="06:05", check_out="14:10", status="Present", hours_worked=8.0, location="Block A – Level 5"),
                Attendance(user_id="", user_name="Robert Thorne", date="2026-08-02", day_name="Sunday", shift_type="Morning", check_in="06:10", check_out="14:00", status="Present", hours_worked=7.8, location="Block A – Level 5"),
                Attendance(user_id="", user_name="Robert Thorne", date="2026-08-01", day_name="Saturday", shift_type="Afternoon", check_in="14:15", check_out="22:00", status="Late", hours_worked=7.5, location="Basement B2"),
                Attendance(user_id="", user_name="Robert Thorne", date="2026-07-31", day_name="Friday", shift_type="Morning", check_in=None, check_out=None, status="On Leave", hours_worked=0.0, location=""),
                Attendance(user_id="", user_name="Robert Thorne", date="2026-07-30", day_name="Thursday", shift_type="Morning", check_in="06:00", check_out="14:02", status="Present", hours_worked=8.0, location="Block A – Level 5"),
            ]
            db.add_all(att)
            db.commit()

        # 9. Seed Notifications
        if db.query(Notification).count() == 0:
            notifs = [
                Notification(title="Milestone Approved", message="Foundation milestone for Skyline Metropolis Tower was approved.", notification_type="success", time="2 hours ago", is_read=False, category="Milestone"),
                Notification(title="New Task Assigned", message="You have been assigned a new task: Waterproofing Basement B2.", notification_type="info", time="5 hours ago", is_read=False, category="Project"),
                Notification(title="Equipment Maintenance Due", message="Excavator CAT 390F is due for service.", notification_type="warning", time="1 day ago", is_read=True, category="System"),
                Notification(title="Safety Alert", message="Storm warning issued for the site. Secure loose materials.", notification_type="danger", time="2 days ago", is_read=True, category="System"),
            ]
            db.add_all(notifs)
            db.commit()

        # 10. Seed Shifts
        if db.query(ShiftModel).count() == 0:
            shifts_seed = [
                ShiftModel(worker_name="Robert Thorne", date="2026-08-03", shift_type="Morning", shift_start="06:00", shift_end="14:00", location="Block A – Level 5", project="Skyline Tower", status="Scheduled"),
                ShiftModel(worker_name="Carlos Mendez", date="2026-08-03", shift_type="Morning", shift_start="06:00", shift_end="14:00", location="Basement B2", project="Skyline Tower", status="Scheduled"),
                ShiftModel(worker_name="Maria Gonzalez", date="2026-08-03", shift_type="Afternoon", shift_start="14:00", shift_end="22:00", location="Foundation Pit", project="Skyline Tower", status="Scheduled"),
                ShiftModel(worker_name="Robert Thorne", date="2026-08-02", shift_type="Morning", shift_start="06:00", shift_end="14:00", location="Block A – Level 5", project="Skyline Tower", status="Completed"),
                ShiftModel(worker_name="James Watson", date="2026-08-02", shift_type="Night", shift_start="22:00", shift_end="06:00", location="Tower Crane", project="Skyline Tower", status="Completed"),
            ]
            db.add_all(shifts_seed)
            db.commit()

    except Exception as err:
        print(f"[Seed Warning] Database seeding notice: {err}")
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "message": "Welcome to BuildTrack Construction Project Management API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "BuildTrack API"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
