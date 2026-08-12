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
from app.models.project_audit import ProjectAuditLog
from app.models.placeholders import Resource, Inventory, Attendance, Procurement, Notification, Report
from app.models.activity_log import ActivityLogModel
from app.models.equipment import EquipmentModel
from app.models.task import TaskModel
from app.models.document import DocumentModel
from app.models.shift import ShiftModel
from app.models.site_progress import (
    DailyProgressReport,
    WeeklyProgressReport,
    WorkCompletionStatus,
    DelayTracking,
    SiteActivityLog,
    ProgressPhotograph,
)
from app.core.security import get_password_hash

from app.routers import auth, users, projects, schedules, milestones, site_engineer, tasks_router, attendance, notifications, shifts, site_progress
from app.routers import resources, inventory, procurement, contractors

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
app.include_router(site_progress.router, prefix=settings.API_V1_STR)
app.include_router(resources.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(procurement.router, prefix=settings.API_V1_STR)
app.include_router(contractors.router, prefix=settings.API_V1_STR)


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
    """Reconcile stale/demo tables with their current model definitions.

    The existing tables may have been created with an older schema that is
    missing columns the models now reference (e.g. attendance.day_name,
    notifications.notification_type), or whose columns do not match the model
    (e.g. the Module 3 site-progress tables were originally created with a
    different column set). Because these are demo/seed tables whose data is
    re-populated by seed_database(), we drop and recreate them to match the
    models exactly. This prevents "UndefinedColumn" errors on every startup
    and keeps create_all() from silently leaving stale tables behind.
    """
    from sqlalchemy import text
    db = SessionLocal()
    try:
# Drop the stale tables so they can be recreated to match the models.
        # Drop child tables first (resource_maintenances, resource_utilizations, resource_allocations -> resources)
        db.execute(text("DROP TABLE IF EXISTS resource_maintenances"))
        db.execute(text("DROP TABLE IF EXISTS resource_utilizations"))
        db.execute(text("DROP TABLE IF EXISTS resource_allocations"))
        db.execute(text("DROP TABLE IF EXISTS progress_photographs"))
        db.execute(text("DROP TABLE IF EXISTS daily_progress_reports"))
        db.execute(text("DROP TABLE IF EXISTS weekly_progress_reports"))
        db.execute(text("DROP TABLE IF EXISTS delay_tracking"))
        db.execute(text("DROP TABLE IF EXISTS site_activity_logs"))
        db.execute(text("DROP TABLE IF EXISTS work_completion_status"))
        db.execute(text("DROP TABLE IF EXISTS attendance"))
        db.execute(text("DROP TABLE IF EXISTS notifications"))
        db.execute(text("DROP TABLE IF EXISTS resources"))
        db.execute(text("DROP TABLE IF EXISTS inventory"))
        db.execute(text("DROP TABLE IF EXISTS procurements"))
        db.execute(text("DROP TABLE IF EXISTS assigned_tasks"))
        db.execute(text("DROP TABLE IF EXISTS documents"))
        db.execute(text("DROP TABLE IF EXISTS shifts"))
        db.execute(text("DROP TABLE IF EXISTS equipment"))
        db.execute(text("DROP TABLE IF EXISTS activity_logs"))
        db.commit()
        db.close()

        # Recreate using SQLAlchemy metadata (matches the model definitions).
        from app.database.session import engine
        from app.models.placeholders import Attendance, Notification, Inventory, Procurement  # noqa: F401
        from app.models.resource import (  # noqa: F401
            ResourceModel,
            ResourceAllocationModel,
            ResourceUtilizationModel,
            ResourceMaintenanceModel,
        )
        from app.models.site_progress import (  # noqa: F401
            DailyProgressReport,
            WeeklyProgressReport,
            WorkCompletionStatus,
            DelayTracking,
            SiteActivityLog,
            ProgressPhotograph,
        )
        from app.models.task import TaskModel  # noqa: F401
        from app.models.document import DocumentModel  # noqa: F401
        from app.models.shift import ShiftModel  # noqa: F401
        from app.models.equipment import EquipmentModel  # noqa: F401
        from app.models.activity_log import ActivityLogModel  # noqa: F401
        Base.metadata.create_all(bind=engine, tables=[
            Attendance.__table__, Notification.__table__,
            ResourceModel.__table__, ResourceAllocationModel.__table__,
            ResourceUtilizationModel.__table__, ResourceMaintenanceModel.__table__,
            Inventory.__table__, Procurement.__table__,
            DailyProgressReport.__table__, WeeklyProgressReport.__table__,
            WorkCompletionStatus.__table__, DelayTracking.__table__,
            SiteActivityLog.__table__, ProgressPhotograph.__table__,
            TaskModel.__table__, DocumentModel.__table__, ShiftModel.__table__,
            EquipmentModel.__table__, ActivityLogModel.__table__,
        ])
        print("[Migration] Recreated attendance, notifications, resources & module 4 tables to match models.")
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
            ("Michael Sterling", "admin@buildtrack.com", "Administrator", "ADM-1001", "Executive Management"),
            ("Elena Rostova", "pm@buildtrack.com", "Project Manager", "PM-2004", "Project Operations"),
            ("Jackson Reed", "engineer@buildtrack.com", "Site Engineer", "ENG-3012", "Civil Engineering"),
            ("Samuel Harris", "contractor@buildtrack.com", "Contractor", "CON-4022", "Structural Contracting"),
            ("Luis Gomez", "worker@buildtrack.com", "Worker", "WRK-5099", "Masonry & Steel"),
            ("Global Innovations Rep", "client@buildtrack.com", "Client", "CLI-9001", "Client Representative")
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
                "project_name": "Nexus Tech Park",
                "project_code": "BT-PRJ-2026-01",
                "category": "Commercial",
                "client_name": "Global Innovations Inc.",
                "client_contact": "+1 (555) 014-7000",
                "description": "State-of-the-art tech campus with LEED-certified green buildings.",
                "location": "Silicon Valley Hub",
                "estimated_budget": 85000000.0,
                "priority": "High",
                "status": "In Progress",
                "start_date": "2026-01-15",
                "expected_completion_date": "2027-11-30"
            },
            {
                "project_name": "Metro Tunnel Network",
                "project_code": "BT-PRJ-2026-02",
                "category": "Infrastructure",
                "client_name": "City Transit Authority",
                "client_contact": "+1 (555) 019-3322",
                "description": "Underground rapid transit tunnel connecting the financial district.",
                "location": "Metropolitan Underground",
                "estimated_budget": 240000000.0,
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

        # Seed Milestones for projects
        all_projs = db.query(Project).all()
        for p in all_projs:
            if db.query(ProjectMilestone).filter(ProjectMilestone.project_id == p.id).count() == 0:
                ms1 = ProjectMilestone(project_id=p.id, milestone_name="Foundation Completion", description="Pile cap & foundation excavation", planned_date="2026-08-15", completion_percentage=85, status="In Progress")
                ms2 = ProjectMilestone(project_id=p.id, milestone_name="Structural Superstructure", description="Columns & slab pours up to Level 10", planned_date="2026-11-30", completion_percentage=40, status="In Progress")
                ms3 = ProjectMilestone(project_id=p.id, milestone_name="Electrical Rough-in", description="Electrical conduit & wiring", planned_date="2027-02-28", completion_percentage=0, status="Pending")
                ms4 = ProjectMilestone(project_id=p.id, milestone_name="Finishing Work & Inspection", description="Interior finishing and safety inspection", planned_date="2027-05-30", completion_percentage=0, status="Pending")
                db.add_all([ms1, ms2, ms3, ms4])
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

        # 11. Seed Module 3 - Site Progress Monitoring data
        first_project = db.query(Project).order_by(Project.created_at.asc()).first()
        second_project = db.query(Project).order_by(Project.created_at.desc()).first()

        if first_project and db.query(DailyProgressReport).count() == 0:
            dpr1 = DailyProgressReport(
                project_id=first_project.id,
                report_date="2026-08-03",
                progress_category="Foundation",
                work_completed="Pile cap formwork completed for Grid C/D; 12 pile caps prepped and rebar cages lowered.",
                progress_percentage=85,
                contractor="Marcus Brody",
                worker_attendance="42 workers present (Morning shift)",
                machinery_used="Concrete Pump Truck CP-8, Tower Crane TC-480",
                materials_consumed="Grade 60 rebar (12 tons), formwork plywood (48 sheets)",
                weather_conditions="Cloudy",
                safety_observations="All personnel wore PPE; no safety incidents reported.",
                quality_inspection_remarks="Rebar spacing within tolerance; inspection approved.",
                delays=False,
                delay_reasons=None,
                comments="Foundation work on track for completion this week.",
                reported_by="David Miller",
                status="Approved"
            )
            dpr2 = DailyProgressReport(
                project_id=first_project.id,
                report_date="2026-08-04",
                progress_category="Structural Work",
                work_completed="Concrete pouring for columns B7-B14 completed. Curing compound applied.",
                progress_percentage=40,
                contractor="Marcus Brody",
                worker_attendance="58 workers present (Morning + Afternoon shifts)",
                machinery_used="Concrete Pump Truck CP-8",
                materials_consumed="Ready-mix concrete (64 m3), curing compound (20 L)",
                weather_conditions="Sunny",
                safety_observations="Safety harnesses used at height; scaffold inspected before pour.",
                quality_inspection_remarks="Concrete slump test passed (75mm).",
                delays=True,
                delay_reasons="2-hour delay due to pump truck maintenance.",
                comments="Structural progress proceeding; minor delay logged.",
                reported_by="David Miller",
                status="Approved"
            )
            dpr3 = DailyProgressReport(
                project_id=first_project.id,
                report_date="2026-08-05",
                progress_category="Electrical Work",
                work_completed="Conduit installation on Level 5 East Wing; rough-in wiring started.",
                progress_percentage=25,
                contractor="VoltWorks Electrical",
                worker_attendance="12 electricians present",
                machinery_used="Bend saw, wire puller",
                materials_consumed="Conduit pipes (300 m), junction boxes (40 units)",
                weather_conditions="Sunny",
                safety_observations="Lockout/tagout verified on live panels.",
                quality_inspection_remarks="Conduit bends within 90° limit; approved.",
                delays=False,
                delay_reasons=None,
                comments="Electrical rough-in on schedule.",
                reported_by="David Miller",
                status="Pending"
            )
            db.add_all([dpr1, dpr2, dpr3])
            db.commit()

        if first_project and db.query(WeeklyProgressReport).count() == 0:
            wpr = WeeklyProgressReport(
                project_id=first_project.id,
                week_start_date="2026-08-03",
                week_end_date="2026-08-09",
                completed_work="Foundation pile caps completed (85%). Column concrete pour for B7-B14 finished. Electrical conduit rough-in started on Level 5.",
                weekly_progress_percentage=15,
                major_activities="Foundation Work, Structural Work, Electrical Work",
                delays="Pump truck maintenance caused a 2-hour delay on 2026-08-04.",
                safety_incidents="No major safety incidents recorded.",
                overall_status="On Track",
                generated_by="Sarah Jenkins"
            )
            db.add(wpr)
            db.commit()

        if first_project and db.query(DelayTracking).count() == 0:
            d1 = DelayTracking(
                project_id=first_project.id,
                reason="Concrete pump truck maintenance",
                duration_days=1,
                affected_work_category="Structural Work",
                impact_on_timeline="Minor - 2 hours lost on column pour; absorbed by float.",
                reported_date="2026-08-04",
                reported_by="David Miller",
                status="Resolved"
            )
            d2 = DelayTracking(
                project_id=first_project.id,
                reason="Weather: heavy rain forecast for foundation excavation",
                duration_days=2,
                affected_work_category="Foundation",
                impact_on_timeline="Potential 2-day slip on foundation completion if rain persists.",
                reported_date="2026-08-02",
                reported_by="David Miller",
                status="Open"
            )
            db.add_all([d1, d2])
            db.commit()

        if first_project and db.query(SiteActivityLog).count() == 0:
            logs = [
                SiteActivityLog(project_id=first_project.id, activity_date="2026-08-05", activity_time="08:00", description="Steel rebar delivery - 20 tons Grade 60 for Level 6.", event_type="Material Delivery", responsible_person="Marcus Brody"),
                SiteActivityLog(project_id=first_project.id, activity_date="2026-08-04", activity_time="10:30", description="Tower crane TC-480 routine maintenance and lubrication.", event_type="Machinery Maintenance", responsible_person="James Watson"),
                SiteActivityLog(project_id=first_project.id, activity_date="2026-08-04", activity_time="07:30", description="Weekly toolbox safety meeting - focus on working at height.", event_type="Safety Meeting", responsible_person="David Miller"),
                SiteActivityLog(project_id=first_project.id, activity_date="2026-08-03", activity_time="13:00", description="Structural engineer inspection of pile cap rebar cages.", event_type="Inspection", responsible_person="David Miller"),
                SiteActivityLog(project_id=first_project.id, activity_date="2026-08-01", activity_time="11:00", description="Client site walkthrough - Apex Real Estate representatives.", event_type="Client Visit", responsible_person="Sarah Jenkins"),
                SiteActivityLog(project_id=first_project.id, activity_date="2026-07-31", activity_time="09:00", description="Internal QA audit of foundation formwork quality.", event_type="Quality Audit", responsible_person="Alex Vance"),
            ]
            db.add_all(logs)
            db.commit()

        # Compute initial completion snapshot for seeded projects
        if first_project:
            from app.services.site_progress_service import SiteProgressService
            try:
                SiteProgressService(db).recompute_completion(first_project.id)
                SiteProgressService(db).sync_milestones_from_reports(first_project.id)
            except Exception as sp_err:
                print(f"[Seed Warning] Site progress completion seed notice: {sp_err}")

        # 12. Seed Resources, Inventory, and Procurement
        from app.models.placeholders import Resource, Inventory, Procurement
        if db.query(Resource).count() == 0:
            res1 = Resource(name="Excavator Komatsu PC210", resource_type="Excavators", project_id=first_project.id if first_project else None, status="Allocated", utilization_percentage=85.0)
            res2 = Resource(name="Asphalt Paver Volvo P6820C", resource_type="Concrete Mixers", project_id=second_project.id if second_project else None, status="Allocated", utilization_percentage=60.0)
            res3 = Resource(name="Mobile Crane Tadano ATF 220G-5", resource_type="Cranes", project_id=first_project.id if first_project else None, status="Maintenance", utilization_percentage=0.0)
            res4 = Resource(name="Safety Harness Kit", resource_type="Safety Equipment", project_id=None, status="Available", utilization_percentage=0.0)
            db.add_all([res1, res2, res3, res4])
            db.commit()

        if db.query(Inventory).count() == 0:
            inv1 = Inventory(item_name="Precast Concrete Panels", quantity=2500, project_id=first_project.id if first_project else None, status="In Stock")
            inv2 = Inventory(item_name="Asphalt Binder (Barrels)", quantity=5, project_id=first_project.id if first_project else None, status="Low Stock")
            inv3 = Inventory(item_name="Heavy-Duty Scaffolding Pipes", quantity=0, project_id=None, status="Out of Stock")
            inv4 = Inventory(item_name="Fiber Optic Cables (Spools)", quantity=45, project_id=second_project.id if second_project else None, status="In Stock")
            db.add_all([inv1, inv2, inv3, inv4])
            db.commit()

        if db.query(Procurement).count() == 0:
            proc1 = Procurement(title="Emergency Cement Order", amount=1200.0, project_id=first_project.id if first_project else None, material_id=None, quantity=200, status="Approved", requested_by="David Miller")
            proc2 = Procurement(title="Formwork Plywood Restock", amount=4500.0, project_id=None, material_id=None, quantity=500, status="Pending Approval", requested_by="Sarah Jenkins")
            proc3 = Procurement(title="Safety Helmets Replacement", amount=850.0, project_id=second_project.id if second_project else None, material_id=None, quantity=100, status="Pending Approval", requested_by="Marcus Brody")
            db.add_all([proc1, proc2, proc3])
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
