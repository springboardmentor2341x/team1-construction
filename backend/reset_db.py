import asyncio
from sqlalchemy import text
from app.database.session import engine, Base, SessionLocal
from main import seed_database
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

def reset():
    print("Dropping schema public cascade...")
    with engine.connect() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        conn.commit()
    
    print("Recreating all tables...")
    Base.metadata.create_all(bind=engine)
    
    print("Seeding fresh database records...")
    seed_database()
    print("Database reset and seeded successfully!")

if __name__ == "__main__":
    reset()
