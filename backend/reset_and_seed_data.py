"""
BuildTrack Master Database Cleanup and Fresh Seeding Script (Modules 1–11)
Performs complete, FK-safe cleanup of all old dummy data from all 52 PostgreSQL tables
and creates a fresh, consistent, fully connected dataset centered on Nexus Tech Park Campus (BT-PRJ-2026-01).
"""

import sys
import uuid
from datetime import date, datetime, timezone
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.session import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.role import Role
from app.models.user import User
from app.models.project import Project
from app.models.schedule import ProjectSchedule
from app.models.milestone import ProjectMilestone
from app.models.assignments import (
    ProjectSiteEngineer,
    ProjectContractor,
    ContractorWorker,
    ProjectClient,
)
from app.models.project_audit import ProjectAuditLog
from app.models.resource import (
    ResourceModel,
    ResourceAllocationModel,
    ResourceUtilizationModel,
    ResourceMaintenanceModel,
)
from app.models.site_progress import (
    DailyProgressReport,
    WeeklyProgressReport,
    WorkCompletionStatus,
    DelayTracking,
    SiteActivityLog,
    ProgressPhotograph,
)
from app.models.notification import Notification
from app.models.activity_log import ActivityLogModel
from app.models.equipment import EquipmentModel
from app.models.task import TaskModel
from app.models.document import DocumentModel
from app.models.shift import ShiftModel
from app.models.material import (
    MaterialCategoryModel,
    MaterialModel,
    MaterialInventoryModel,
    MaterialRequestModel,
    MaterialAllocationModel,
    StockMovementModel,
)
from app.models.workforce import (
    WorkforceCategory,
    Worker,
    WorkerProjectAssignment,
    WorkerShiftAssignment,
    AttendanceModel,
    WorkforcePayroll,
)
from app.models.procurement import (
    ProcurementCategoryModel,
    VendorModel,
    ProcurementRequestModel,
    ProcurementRequestItemModel,
    PurchaseOrderModel,
    PurchaseOrderItemModel,
    InvoiceModel,
)
from app.models.budget import (
    ProjectBudget,
    BudgetCategoryAllocation,
    CostEstimate,
    ActualExpense,
    BUDGET_CATEGORIES,
)


def clean_and_seed():
    db: Session = SessionLocal()
    print("==========================================================")
    print("   BuildTrack Database Cleanup & Fresh Data Seeding (M1-M11)   ")
    print("==========================================================")

    try:
        # Step 0: Ensure all SQLAlchemy schemas exist
        Base.metadata.create_all(bind=engine)

        # Step 1: Ensure standard Roles exist in database
        print("\n[Step 1] Initializing Standard BuildTrack Roles...")
        role_definitions = [
            ("Administrator", "Full system control, user management, and security oversight"),
            ("Project Manager", "Project scheduling, budget allocation, vendor approval, and reporting"),
            ("Site Engineer", "Daily site progress logging, material inspections, and equipment tracking"),
            ("Contractor", "Task assignment, workforce allocation, and subcontractor coordination"),
            ("Worker", "Task execution, attendance logging, and shift schedules"),
            ("Client", "Executive report access, document review, and progress visibility"),
        ]

        roles_by_name = {}
        for r_name, r_desc in role_definitions:
            role_obj = db.query(Role).filter(Role.name == r_name).first()
            if not role_obj:
                role_obj = Role(name=r_name, description=r_desc)
                db.add(role_obj)
                db.commit()
                db.refresh(role_obj)
            roles_by_name[r_name] = role_obj

        # Step 2: Ensure 6 Primary System Login Accounts Exist with Secure Bcrypt Passwords
        print("\n[Step 2] Provisioning Core System User Accounts...")
        default_pwd_hash = get_password_hash("Password123!")

        core_users_spec = [
            {
                "email": "admin@buildtrack.com",
                "full_name": "Victor Vance",
                "role_name": "Administrator",
                "designation": "Administrator",
                "department": "Executive Board",
                "employee_id": "EMP-ADM-001",
                "mobile": "+1 (555) 019-1000",
            },
            {
                "email": "pm@buildtrack.com",
                "full_name": "Elena Rostova",
                "role_name": "Project Manager",
                "designation": "Project Manager",
                "department": "Project Operations",
                "employee_id": "EMP-PM-001",
                "mobile": "+1 (555) 019-2000",
            },
            {
                "email": "engineer@buildtrack.com",
                "full_name": "Jackson Reed",
                "role_name": "Site Engineer",
                "designation": "Site Engineer",
                "department": "Site Operations",
                "employee_id": "EMP-ENG-001",
                "mobile": "+1 (555) 019-3000",
            },
            {
                "email": "contractor@buildtrack.com",
                "full_name": "Samuel Harris",
                "role_name": "Contractor",
                "designation": "Contractor",
                "department": "Structural Construction",
                "employee_id": "EMP-CON-001",
                "mobile": "+1 (555) 019-4000",
            },
            {
                "email": "worker@buildtrack.com",
                "full_name": "Marcus Vance",
                "role_name": "Worker",
                "designation": "Worker",
                "department": "Site Workforce",
                "employee_id": "EMP-WRK-001",
                "mobile": "+1 (555) 019-5000",
            },
            {
                "email": "client@buildtrack.com",
                "full_name": "Arthur Pendelton",
                "role_name": "Client",
                "designation": "Client Representative",
                "department": "Global Innovations Inc.",
                "employee_id": "EMP-CLT-001",
                "mobile": "+1 (555) 019-6000",
            },
        ]

        user_by_email = {}
        for spec in core_users_spec:
            u_obj = db.query(User).filter(User.email == spec["email"]).first()
            role_id = roles_by_name[spec["role_name"]].id
            if not u_obj:
                u_obj = User(
                    full_name=spec["full_name"],
                    email=spec["email"],
                    mobile=spec["mobile"],
                    password_hash=default_pwd_hash,
                    employee_id=spec["employee_id"],
                    department=spec["department"],
                    designation=spec["designation"],
                    role_id=role_id,
                    is_active=True,
                )
                db.add(u_obj)
                db.commit()
                db.refresh(u_obj)
            else:
                # Refresh credentials and role
                u_obj.password_hash = default_pwd_hash
                u_obj.role_id = role_id
                u_obj.is_active = True
                db.commit()
                db.refresh(u_obj)
            user_by_email[spec["email"]] = u_obj

        admin_user = user_by_email["admin@buildtrack.com"]
        pm_user = user_by_email["pm@buildtrack.com"]
        engineer_user = user_by_email["engineer@buildtrack.com"]
        contractor_user = user_by_email["contractor@buildtrack.com"]
        worker_user = user_by_email["worker@buildtrack.com"]
        client_user = user_by_email["client@buildtrack.com"]

        # Step 3: Delete Old Test Data (Strict Reverse Dependency Order across all 52 tables)
        print("\n[Step 3] Purging obsolete business records from PostgreSQL database...")

        # Module 11 cleanup
        db.query(ActualExpense).delete(synchronize_session=False)
        db.query(CostEstimate).delete(synchronize_session=False)
        db.query(BudgetCategoryAllocation).delete(synchronize_session=False)
        db.query(ProjectBudget).delete(synchronize_session=False)

        # Module 10 / Documents / Reports
        db.query(DocumentModel).delete(synchronize_session=False)
        db.execute(text('DELETE FROM reports WHERE 1=1'))

        # Module 8 / Notifications / Audit
        db.query(Notification).delete(synchronize_session=False)
        db.query(ActivityLogModel).delete(synchronize_session=False)
        db.execute(text('DELETE FROM daily_activity_logs WHERE 1=1'))

        # Module 7 / Procurement
        db.query(InvoiceModel).delete(synchronize_session=False)
        db.query(PurchaseOrderItemModel).delete(synchronize_session=False)
        db.query(PurchaseOrderModel).delete(synchronize_session=False)
        db.query(ProcurementRequestItemModel).delete(synchronize_session=False)
        db.query(ProcurementRequestModel).delete(synchronize_session=False)
        db.query(VendorModel).delete(synchronize_session=False)
        db.query(ProcurementCategoryModel).delete(synchronize_session=False)
        db.execute(text('DELETE FROM procurements WHERE 1=1'))

        # Module 6 / Workforce
        db.query(WorkforcePayroll).delete(synchronize_session=False)
        db.query(AttendanceModel).delete(synchronize_session=False)
        db.query(WorkerShiftAssignment).delete(synchronize_session=False)
        db.query(WorkerProjectAssignment).delete(synchronize_session=False)
        db.query(ContractorWorker).delete(synchronize_session=False)
        db.query(Worker).delete(synchronize_session=False)
        db.query(WorkforceCategory).delete(synchronize_session=False)
        db.query(ShiftModel).delete(synchronize_session=False)

        # Module 5 / Materials & Inventory
        db.query(StockMovementModel).delete(synchronize_session=False)
        db.query(MaterialAllocationModel).delete(synchronize_session=False)
        db.query(MaterialRequestModel).delete(synchronize_session=False)
        db.query(MaterialInventoryModel).delete(synchronize_session=False)
        db.query(MaterialModel).delete(synchronize_session=False)
        db.query(MaterialCategoryModel).delete(synchronize_session=False)

        # Module 4 / Resources
        db.query(ResourceMaintenanceModel).delete(synchronize_session=False)
        db.query(ResourceUtilizationModel).delete(synchronize_session=False)
        db.query(ResourceAllocationModel).delete(synchronize_session=False)
        db.query(ResourceModel).delete(synchronize_session=False)
        db.query(EquipmentModel).delete(synchronize_session=False)
        db.execute(text('DELETE FROM equipment_status WHERE 1=1'))

        # Module 3 / Site Progress
        db.query(ProgressPhotograph).delete(synchronize_session=False)
        db.query(DailyProgressReport).delete(synchronize_session=False)
        db.query(WeeklyProgressReport).delete(synchronize_session=False)
        db.query(DelayTracking).delete(synchronize_session=False)
        db.query(SiteActivityLog).delete(synchronize_session=False)
        db.query(WorkCompletionStatus).delete(synchronize_session=False)

        # Module 2 / Projects & Tasks
        db.query(ProjectAuditLog).delete(synchronize_session=False)
        db.query(ProjectContractor).delete(synchronize_session=False)
        db.query(ProjectSiteEngineer).delete(synchronize_session=False)
        db.query(ProjectClient).delete(synchronize_session=False)
        db.query(ProjectSchedule).delete(synchronize_session=False)
        db.query(ProjectMilestone).delete(synchronize_session=False)
        db.query(TaskModel).delete(synchronize_session=False)
        db.query(Project).delete(synchronize_session=False)

        # Purge temporary test users (keep only core 6 system users)
        db.execute(
            text(
                "DELETE FROM users WHERE email NOT IN ('admin@buildtrack.com', 'pm@buildtrack.com', 'engineer@buildtrack.com', 'contractor@buildtrack.com', 'worker@buildtrack.com', 'client@buildtrack.com')"
            )
        )

        db.commit()
        print("  [OK] Cleared all old dummy records from PostgreSQL database.")

        # Step 4: Populate Fresh Connected BuildTrack Dataset (Modules 1–11)

        # A. Central Construction Project (Module 2)
        print("\n[Seeding Module 2] Creating primary central construction project...")
        p1 = Project(
            project_name="Nexus Tech Park Campus",
            project_code="BT-PRJ-2026-01",
            category="Commercial",
            client_name="Global Innovations Inc.",
            client_contact="+1 (555) 014-7000",
            description="State-of-the-art tech campus featuring LEED-certified smart office towers, underground parking, and solar energy grid.",
            location="Silicon Valley Hub",
            estimated_budget=85000000.0,
            priority="High",
            status="In Progress",
            start_date="2026-01-15",
            expected_completion_date="2027-11-30",
            project_manager_id=pm_user.id,
        )
        db.add(p1)
        db.commit()
        db.refresh(p1)
        print(f"  [OK] Created Central Project: '{p1.project_name}' ({p1.project_code})")

        # Project Assignments
        db.add(ProjectSiteEngineer(project_id=p1.id, site_engineer_id=engineer_user.id))
        db.add(ProjectContractor(project_id=p1.id, contractor_id=contractor_user.id))
        db.add(ContractorWorker(contractor_id=contractor_user.id, worker_id=worker_user.id, project_id=p1.id))
        db.add(ProjectClient(project_id=p1.id, client_id=client_user.id))
        db.commit()
        print("  [OK] Assigned PM, Site Engineer, Contractor, Worker, and Client to Project.")

        # Project Milestones & Schedules
        m1 = ProjectMilestone(
            project_id=p1.id,
            milestone_name="Site Excavation & Substructure",
            description="Foundation excavation, pile caps, and basement slab pour.",
            planned_date="2026-04-30",
            actual_completion_date="2026-04-28",
            completion_percentage=100,
            status="Completed",
        )
        m2 = ProjectMilestone(
            project_id=p1.id,
            milestone_name="Structural Concrete & Steel Superstructure",
            description="Reinforced concrete columns, beams, and slab pours up to Level 15.",
            planned_date="2026-10-31",
            completion_percentage=75,
            status="In Progress",
        )
        m3 = ProjectMilestone(
            project_id=p1.id,
            milestone_name="Electrical & Mechanical Rough-in",
            description="HVAC ductwork, electrical conduit, and plumbing risers.",
            planned_date="2027-04-30",
            completion_percentage=30,
            status="In Progress",
        )
        m4 = ProjectMilestone(
            project_id=p1.id,
            milestone_name="Interior Finishing & Handover",
            description="Drywall, glass facade, interior fit-out, and final safety inspection.",
            planned_date="2027-11-30",
            completion_percentage=0,
            status="Pending",
        )
        db.add_all([m1, m2, m3, m4])
        db.commit()
        db.refresh(m1)
        db.refresh(m2)
        db.refresh(m3)
        db.refresh(m4)

        s1 = ProjectSchedule(
            project_id=p1.id,
            phase_name="Phase 1: Substructure Excavation",
            description="Pile cap & basement slab excavation",
            planned_start_date="2026-01-15",
            planned_end_date="2026-04-30",
            estimated_duration=105,
        )
        s2 = ProjectSchedule(
            project_id=p1.id,
            phase_name="Phase 2: Superstructure Framing",
            description="Concrete columns, beams & slab pours",
            planned_start_date="2026-05-01",
            planned_end_date="2026-10-31",
            estimated_duration=184,
        )
        s3 = ProjectSchedule(
            project_id=p1.id,
            phase_name="Phase 3: MEP & Envelope",
            description="HVAC, electrical conduit & plumbing risers",
            planned_start_date="2026-11-01",
            planned_end_date="2027-04-30",
            estimated_duration=181,
        )
        s4 = ProjectSchedule(
            project_id=p1.id,
            phase_name="Phase 4: Fit-out & Inspection",
            description="Interior finishing & safety sign-off",
            planned_start_date="2027-05-01",
            planned_end_date="2027-11-30",
            estimated_duration=214,
        )
        db.add_all([s1, s2, s3, s4])
        db.commit()

        # Construction Tasks
        print("  [OK] Creating construction tasks for Project...")
        tasks = [
            TaskModel(
                title="Site Preparation & Demolition",
                description="Clear ground vegetation, demolish existing masonry shed, setup site perimeter fencing.",
                project=p1.project_name,
                project_id=p1.id,
                assigned_to=contractor_user.full_name,
                assigned_to_id=contractor_user.id,
                milestone_id=m1.id,
                contractor_id=contractor_user.id,
                worker_id=worker_user.id,
                status="Completed",
                priority="High",
                due_date="2026-02-15",
                location=p1.location,
            ),
            TaskModel(
                title="Foundation Work & Pile Caps",
                description="Deep pile drilling, rebar cage installation, and foundation concrete pour.",
                project=p1.project_name,
                project_id=p1.id,
                assigned_to=contractor_user.full_name,
                assigned_to_id=contractor_user.id,
                milestone_id=m1.id,
                contractor_id=contractor_user.id,
                worker_id=worker_user.id,
                status="Completed",
                priority="High",
                due_date="2026-04-28",
                location=p1.location,
            ),
            TaskModel(
                title="Column Construction (Level 1-6)",
                description="Reinforced concrete column formwork, steel tying, and slump-tested concrete pouring.",
                project=p1.project_name,
                project_id=p1.id,
                assigned_to=engineer_user.full_name,
                assigned_to_id=engineer_user.id,
                milestone_id=m2.id,
                contractor_id=contractor_user.id,
                worker_id=worker_user.id,
                status="In Progress",
                priority="High",
                due_date="2026-08-30",
                location=p1.location,
            ),
            TaskModel(
                title="Structural Steel Installation",
                description="Erect structural steel beams and perimeter roof truss framing.",
                project=p1.project_name,
                project_id=p1.id,
                assigned_to=contractor_user.full_name,
                assigned_to_id=contractor_user.id,
                milestone_id=m2.id,
                contractor_id=contractor_user.id,
                worker_id=worker_user.id,
                status="In Progress",
                priority="Medium",
                due_date="2026-10-15",
                location=p1.location,
            ),
            TaskModel(
                title="Electrical Conduit Installation",
                description="Lay primary electrical main conduits across basement and office floor slabs.",
                project=p1.project_name,
                project_id=p1.id,
                assigned_to=engineer_user.full_name,
                assigned_to_id=engineer_user.id,
                milestone_id=m3.id,
                contractor_id=contractor_user.id,
                worker_id=worker_user.id,
                status="Open",
                priority="Medium",
                due_date="2027-01-31",
                location=p1.location,
            ),
            TaskModel(
                title="Plumbing Risers & Drainage",
                description="Install main vertical plumbing stacks, water supply lines, and stormwater drains.",
                project=p1.project_name,
                project_id=p1.id,
                assigned_to=engineer_user.full_name,
                assigned_to_id=engineer_user.id,
                milestone_id=m3.id,
                contractor_id=contractor_user.id,
                worker_id=worker_user.id,
                status="Open",
                priority="Medium",
                due_date="2027-04-30",
                location=p1.location,
            ),
            TaskModel(
                title="Flooring & Tile Work",
                description="Subfloor screed leveling, tile laying, and polished concrete finishing.",
                project=p1.project_name,
                project_id=p1.id,
                assigned_to=contractor_user.full_name,
                assigned_to_id=contractor_user.id,
                milestone_id=m4.id,
                contractor_id=contractor_user.id,
                worker_id=worker_user.id,
                status="Open",
                priority="Low",
                due_date="2027-07-31",
                location=p1.location,
            ),
            TaskModel(
                title="Interior Architectural Finishing",
                description="Drywall partitioning, acoustic ceiling tile installation, and interior painting.",
                project=p1.project_name,
                project_id=p1.id,
                assigned_to=contractor_user.full_name,
                assigned_to_id=contractor_user.id,
                milestone_id=m4.id,
                contractor_id=contractor_user.id,
                worker_id=worker_user.id,
                status="Open",
                priority="Low",
                due_date="2027-10-31",
                location=p1.location,
            ),
            TaskModel(
                title="Final Quality & Safety Inspection",
                description="Conduct thorough structural integrity audit, fire safety signoff, and client walkthrough.",
                project=p1.project_name,
                project_id=p1.id,
                assigned_to=pm_user.full_name,
                assigned_to_id=pm_user.id,
                milestone_id=m4.id,
                contractor_id=contractor_user.id,
                worker_id=worker_user.id,
                status="Open",
                priority="High",
                due_date="2027-11-30",
                location=p1.location,
            ),
        ]
        db.add_all(tasks)
        db.commit()

        # Audit logs & documents
        db.add(ProjectAuditLog(project_id=p1.id, action="PROJECT_CREATED", performed_by=admin_user.id, performed_by_name=admin_user.full_name, description="Nexus Tech Park Campus project initialized."))
        db.add(DocumentModel(name="Architectural Blueprint v2.1", type="PDF", project=p1.project_name, uploaded_by=pm_user.full_name, upload_date="2026-08-01", size="12.5 MB", category="Blueprint"))
        db.commit()

        # B. Module 3 – Site Progress Data
        print("\n[Seeding Module 3] Creating daily progress reports, weekly summaries, delays, and activity logs...")
        dpr1 = DailyProgressReport(
            project_id=p1.id,
            report_date="2026-08-08",
            progress_category="Foundation",
            work_completed="Pile cap excavation and reinforced concrete pouring for foundation Grid B1-B8 completed successfully.",
            progress_percentage=100,
            contractor="Samuel Harris (Structural Contracting)",
            worker_attendance="18 workers present (Morning Shift)",
            worker_count=18,
            worker_absent=0,
            worker_hours=8.0,
            machinery_used="Heavy Excavator Komatsu PC210, Concrete Pump Truck CP-8",
            materials_consumed="Portland Cement (200 bags), Grade 60 Rebar (15 tons)",
            cost_incurred=14500.0,
            weather_conditions="Sunny",
            safety_observations="100% PPE compliance; daily toolbox safety meeting conducted before shift.",
            quality_inspection_remarks="Slump test passed (75mm). Rebar spacing verified against engineering drawings.",
            delays=False,
            delay_reasons=None,
            comments="Substructure work completed on schedule.",
            reported_by=engineer_user.full_name,
            reported_by_id=engineer_user.id,
            status="Approved",
        )

        dpr2 = DailyProgressReport(
            project_id=p1.id,
            report_date="2026-08-09",
            progress_category="Structural Work",
            work_completed="Column formwork installation and concrete pour for Level 6 perimeter columns C1-C10.",
            progress_percentage=75,
            contractor="Samuel Harris (Structural Contracting)",
            worker_attendance="22 workers present (Morning + Afternoon Shifts)",
            worker_count=22,
            worker_absent=1,
            worker_hours=8.0,
            machinery_used="Tower Crane TC-480, Concrete Mixer Truck",
            materials_consumed="Ready-mix Concrete (45 m3), Formwork Plywood (30 sheets)",
            cost_incurred=18200.0,
            weather_conditions="Cloudy",
            safety_observations="Safety harnesses tied off during high-level formwork placement.",
            quality_inspection_remarks="Concrete cube test samples collected for 7-day lab compression test.",
            delays=True,
            delay_reasons="1-day delay due to morning heavy rain and wet formwork conditions.",
            comments="Column pouring resumed post-noon after weather cleared.",
            reported_by=engineer_user.full_name,
            reported_by_id=engineer_user.id,
            status="Approved",
        )

        db.add_all([dpr1, dpr2])
        db.commit()

        photo1 = ProgressPhotograph(report_id=dpr1.id, photo_url="https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600", caption="Foundation concrete pour grid B1-B8", uploaded_by=engineer_user.full_name)
        photo2 = ProgressPhotograph(report_id=dpr2.id, photo_url="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600", caption="Level 6 column formwork inspection", uploaded_by=engineer_user.full_name)
        db.add_all([photo1, photo2])

        wpr = WeeklyProgressReport(
            project_id=p1.id,
            week_start_date="2026-08-03",
            week_end_date="2026-08-09",
            completed_work="Foundation pile caps 100% completed. Structural columns for Level 6 poured (75%). Electrical conduit rough-in initiated on Level 5.",
            weekly_progress_percentage=22,
            worker_hours=384.0,
            worker_count=50,
            major_activities="Foundation Work, Structural Work, Electrical Work",
            delays="1-day rain delay on 2026-08-09; column pour completed in afternoon shift.",
            safety_incidents="Zero lost-time injuries. 100% PPE compliance observed.",
            overall_status="On Track",
            generated_by=pm_user.full_name,
        )
        db.add(wpr)

        delay1 = DelayTracking(
            project_id=p1.id,
            reason="Heavy morning rainfall causing slippery scaffold and wet formwork",
            duration_days=1,
            affected_work_category="Structural Work",
            impact_on_timeline="Minor - 1 day shift absorbed by project buffer.",
            reported_date="2026-08-09",
            reported_by=engineer_user.full_name,
            remarks="Work resumed in afternoon shift once weather cleared.",
            status="Open",
        )
        db.add(delay1)

        log1 = SiteActivityLog(project_id=p1.id, activity_date="2026-08-10", activity_time="07:30", description="Daily site safety meeting and hazard identification walk.", event_type="Safety Meeting", responsible_person=engineer_user.full_name)
        log2 = SiteActivityLog(project_id=p1.id, activity_date="2026-08-09", activity_time="09:00", description="Delivery of 15 tons Grade 60 steel rebar and unloading.", event_type="Material Delivery", responsible_person="Samuel Harris")
        db.add_all([log1, log2])
        db.commit()

        # C. Module 4 – Resource Management Data
        print("\n[Seeding Module 4] Creating equipment resources, allocations, utilization, and maintenance...")
        r1 = ResourceModel(
            equipment_code="EXC-001",
            name="Heavy Hydraulic Excavator Komatsu PC210",
            category="Excavators",
            description="20-ton crawler excavator equipped with heavy rock bucket.",
            status="Allocated",
            location="Silicon Valley Hub Site",
            responsible_person_id=engineer_user.id,
            responsible_person_name=engineer_user.full_name,
            project_id=p1.id,
            serial_number="KOM-PC210-9941",
            purchase_date="2024-03-15",
            purchase_cost=145000.0,
            utilization_percentage=80.0,
        )
        r2 = ResourceModel(
            equipment_code="PMP-001",
            name="High-Capacity Concrete Pump Truck CP-8",
            category="Concrete Equipment",
            description="Truck-mounted concrete pump with 38m boom reach.",
            status="Allocated",
            location="Silicon Valley Hub Site",
            responsible_person_id=engineer_user.id,
            responsible_person_name=engineer_user.full_name,
            project_id=p1.id,
            serial_number="CPT-38M-2201",
            purchase_date="2024-06-10",
            purchase_cost=180000.0,
            utilization_percentage=75.0,
        )
        r3 = ResourceModel(
            equipment_code="CRN-001",
            name="Tower Crane TC-480",
            category="Cranes",
            description="High-capacity tower crane for heavy superstructure lifting.",
            status="Allocated",
            location="Silicon Valley Hub Site",
            responsible_person_id=engineer_user.id,
            responsible_person_name=engineer_user.full_name,
            project_id=p1.id,
            serial_number="TC-480-8812",
            purchase_date="2023-11-20",
            purchase_cost=320000.0,
            utilization_percentage=85.0,
        )
        db.add_all([r1, r2, r3])
        db.commit()

        alloc1 = ResourceAllocationModel(
            resource_id=r1.id,
            project_id=p1.id,
            allocation_date="2026-08-01",
            expected_return_date="2026-08-31",
            responsible_person_id=engineer_user.id,
            responsible_person_name=engineer_user.full_name,
            location="Silicon Valley Hub Site",
            notes="Assigned for site excavation and foundation trenching.",
            status="Active",
        )
        db.add(alloc1)

        u1 = ResourceUtilizationModel(
            resource_id=r1.id,
            project_id=p1.id,
            date="2026-08-08",
            operating_hours=8.0,
            idle_hours=2.0,
            total_available_hours=10.0,
            utilization_percentage=80.0,
            notes="Basement trench excavation",
        )
        db.add(u1)

        maint1 = ResourceMaintenanceModel(
            resource_id=r1.id,
            maintenance_type="Preventive Service",
            maintenance_date="2026-08-02",
            service_engineer="Komatsu Heavy Machinery Services",
            maintenance_cost=125000.0,
            description="Engine oil change, hydraulic fluid top-up, and filter replacement.",
            next_maintenance_date="2026-11-02",
            status="Completed",
        )
        db.add(maint1)
        db.commit()

        # D. Module 5 – Material & Inventory Management Data
        print("\n[Seeding Module 5] Creating material categories, inventory stock, requests, and allocations...")
        cat_cem = MaterialCategoryModel(name="Cement", description="OPC and PPC structural grade cement")
        cat_stl = MaterialCategoryModel(name="Steel", description="TMT steel rebar and structural beams")
        cat_brk = MaterialCategoryModel(name="Bricks", description="Red clay bricks and concrete masonry blocks")
        cat_snd = MaterialCategoryModel(name="Sand", description="M-Sand and River Sand aggregate")
        cat_con = MaterialCategoryModel(name="Concrete", description="Ready Mix Concrete (RMC)")
        cat_ele = MaterialCategoryModel(name="Electrical", description="Armored copper cables and conduits")
        cat_plm = MaterialCategoryModel(name="Plumbing", description="PVC, CPVC pipes and drainage fittings")
        db.add_all([cat_cem, cat_stl, cat_brk, cat_snd, cat_con, cat_ele, cat_plm])
        db.commit()

        m_cem = MaterialModel(material_code="MAT-CEM-01", name="Portland OPC Cement 53 Grade", category_id=cat_cem.id, category_name=cat_cem.name, unit_of_measure="Bags", min_stock_level=500.0, unit_price=350.0, description="High-grade Ordinary Portland Cement for structural pours.")
        m_stl = MaterialModel(material_code="MAT-STL-01", name="TMT Rebar 12mm Grade 60", category_id=cat_stl.id, category_name=cat_stl.name, unit_of_measure="Tons", min_stock_level=20.0, unit_price=65000.0, description="Thermo-Mechanically Treated steel rebar for structural reinforcement.")
        m_brk = MaterialModel(material_code="MAT-BRK-01", name="Red Clay Bricks (Class A)", category_id=cat_brk.id, category_name=cat_brk.name, unit_of_measure="Pieces", min_stock_level=10000.0, unit_price=12.0, description="High-density kiln fired red bricks.")
        m_snd = MaterialModel(material_code="MAT-SND-01", name="M-Sand Manufactured Sand", category_id=cat_snd.id, category_name=cat_snd.name, unit_of_measure="Tons", min_stock_level=50.0, unit_price=1200.0, description="Washed manufactured sand for concrete mixing.")
        m_con = MaterialModel(material_code="MAT-CON-01", name="Ready Mix Concrete M30", category_id=cat_con.id, category_name=cat_con.name, unit_of_measure="Cu M", min_stock_level=50.0, unit_price=4500.0, description="Premixed M30 grade concrete.")
        m_ele = MaterialModel(material_code="MAT-ELE-01", name="Heavy Armored Electrical Cable 4-Core", category_id=cat_ele.id, category_name=cat_ele.name, unit_of_measure="Meters", min_stock_level=200.0, unit_price=450.0, description="Subterranean power distribution cable.")
        m_plm = MaterialModel(material_code="MAT-PLM-01", name="High-Density PVC Pipe 4-inch", category_id=cat_plm.id, category_name=cat_plm.name, unit_of_measure="Meters", min_stock_level=100.0, unit_price=280.0, description="Heavy-duty drainage and waste pipe.")
        db.add_all([m_cem, m_stl, m_brk, m_snd, m_con, m_ele, m_plm])
        db.commit()

        inv_cem = MaterialInventoryModel(material_id=m_cem.id, warehouse_location="Central Store Zone A", total_stock=3000.0, allocated_stock=400.0, consumed_stock=250.0, available_stock=2350.0, min_stock_level=500.0, status="In Stock")
        inv_stl = MaterialInventoryModel(material_id=m_stl.id, warehouse_location="Steel Yard Zone B", total_stock=80.0, allocated_stock=15.0, consumed_stock=10.0, available_stock=55.0, min_stock_level=20.0, status="In Stock")
        inv_brk = MaterialInventoryModel(material_id=m_brk.id, warehouse_location="Masonry Yard", total_stock=25000.0, allocated_stock=5000.0, consumed_stock=2000.0, available_stock=18000.0, min_stock_level=10000.0, status="In Stock")
        inv_snd = MaterialInventoryModel(material_id=m_snd.id, warehouse_location="Aggregate Yard", total_stock=120.0, allocated_stock=20.0, consumed_stock=10.0, available_stock=90.0, min_stock_level=50.0, status="In Stock")
        inv_con = MaterialInventoryModel(material_id=m_con.id, warehouse_location="Batch Plant", total_stock=100.0, allocated_stock=45.0, consumed_stock=45.0, available_stock=10.0, min_stock_level=50.0, status="Low Stock")
        inv_ele = MaterialInventoryModel(material_id=m_ele.id, warehouse_location="MEP Store", total_stock=800.0, allocated_stock=100.0, consumed_stock=50.0, available_stock=650.0, min_stock_level=200.0, status="In Stock")
        inv_plm = MaterialInventoryModel(material_id=m_plm.id, warehouse_location="MEP Store", total_stock=500.0, allocated_stock=50.0, consumed_stock=20.0, available_stock=430.0, min_stock_level=100.0, status="In Stock")
        db.add_all([inv_cem, inv_stl, inv_brk, inv_snd, inv_con, inv_ele, inv_plm])
        db.commit()

        mat_req1 = MaterialRequestModel(
            request_code="REQ-2026-001",
            project_id=p1.id,
            material_id=m_cem.id,
            material_name=m_cem.name,
            category_name=m_cem.category_name,
            unit=m_cem.unit_of_measure,
            requested_by_id=engineer_user.id,
            requested_by_name=engineer_user.full_name,
            required_quantity=500.0,
            required_date="2026-08-15",
            work_activity="Foundation Block B Column Pours",
            status="Approved",
            remarks="Approved by PM for column pours",
        )
        db.add(mat_req1)
        db.commit()

        mat_alloc1 = MaterialAllocationModel(
            project_id=p1.id,
            material_id=m_cem.id,
            request_id=mat_req1.id,
            quantity=400.0,
            consumed_quantity=250.0,
            allocation_date="2026-08-10",
            work_activity="Foundation Block B Column Pours",
            responsible_user_id=pm_user.id,
            responsible_user_name=pm_user.full_name,
            status="Consumed",
        )
        db.add(mat_alloc1)

        sm1 = StockMovementModel(
            material_id=m_cem.id,
            project_id=p1.id,
            movement_type="RECEIVED",
            quantity=2000.0,
            movement_date="2026-08-01",
            user_id=admin_user.id,
            user_name=admin_user.full_name,
            reference_id="GRN-2026-001",
            remarks="Initial bulk cement delivery",
        )
        db.add(sm1)
        db.commit()

        # E. Module 6 – Workforce & Payroll Data
        print("\n[Seeding Module 6] Creating workforce categories, workers, assignments, shifts, attendance, and payroll...")
        wf_cat1 = WorkforceCategory(name="Masonry & Concrete", description="Skilled concrete, formwork, and bricklaying workers")
        wf_cat2 = WorkforceCategory(name="Steel Rebar Tying", description="Reinforcement steel cages and rebar tying specialists")
        wf_cat3 = WorkforceCategory(name="Electrical Systems", description="Licensed electrician installers and cable pullers")
        wf_cat4 = WorkforceCategory(name="Plumbing Systems", description="Pipe fitters and sanitary plumbing technicians")
        wf_cat5 = WorkforceCategory(name="Structural Welding", description="Certified steel structure welders")
        db.add_all([wf_cat1, wf_cat2, wf_cat3, wf_cat4, wf_cat5])
        db.commit()

        w1 = Worker(
            worker_id="WRK-2026-01",
            worker_name="Marcus Vance",
            contact_information="+1 (555) 321-9988",
            workforce_category_id=wf_cat1.id,
            skill_or_work_type="Master Mason",
            contractor_id=contractor_user.id,
            joining_date="2026-01-10",
            worker_status="Active",
            pay_rate=350.0,
        )
        w2 = Worker(
            worker_id="WRK-2026-02",
            worker_name="David Miller",
            contact_information="+1 (555) 443-8811",
            workforce_category_id=wf_cat2.id,
            skill_or_work_type="Senior Rebar Fitter",
            contractor_id=contractor_user.id,
            joining_date="2026-02-01",
            worker_status="Active",
            pay_rate=400.0,
        )
        w3 = Worker(
            worker_id="WRK-2026-03",
            worker_name="Carlos Mendez",
            contact_information="+1 (555) 554-7722",
            workforce_category_id=wf_cat3.id,
            skill_or_work_type="Lead Electrician",
            contractor_id=contractor_user.id,
            joining_date="2026-02-15",
            worker_status="Active",
            pay_rate=380.0,
        )
        db.add_all([w1, w2, w3])
        db.commit()

        w_assign1 = WorkerProjectAssignment(
            worker_id=w1.id,
            project_id=p1.id,
            contractor_id=contractor_user.id,
            work_activity="Column Formwork & Pouring",
            assignment_start_date="2026-01-15",
            assignment_status="Active",
        )
        db.add(w_assign1)

        shift1 = ShiftModel(
            shift_name="Morning Concrete Shift",
            worker_name="Marcus Vance",
            date="2026-08-08",
            shift_type="Morning",
            shift_start="07:00",
            shift_end="15:30",
            project_id=p1.id,
            location="Nexus Tech Park Site",
            status="Scheduled",
        )
        db.add(shift1)
        db.commit()

        w_shift1 = WorkerShiftAssignment(shift_id=shift1.id, worker_id=w1.id)
        db.add(w_shift1)

        att1 = AttendanceModel(
            worker_id=w1.id,
            project_id=p1.id,
            shift_id=shift1.id,
            date="2026-08-08",
            day_name="Saturday",
            shift_type="Morning",
            check_in="07:00",
            check_out="15:30",
            status="Present",
            hours_worked=8.0,
            overtime_hours=0.0,
            location="Nexus Tech Park Site",
        )
        db.add(att1)

        pay1 = WorkforcePayroll(
            worker_id=w1.id,
            project_id=p1.id,
            pay_period_start="2026-08-01",
            pay_period_end="2026-08-15",
            pay_rate=350.0,
            working_days=10.0,
            working_hours=80.0,
            overtime_hours=4.0,
            estimated_pay=145000.0,
            payroll_status="Approved",
        )
        db.add(pay1)
        db.commit()

        # F. Module 7 – Procurement & Vendor Data
        print("\n[Seeding Module 7] Creating vendor directory, procurement requests, purchase orders, receiving, and invoices...")
        p_cat = ProcurementCategoryModel(name="Raw Materials", description="Cement, steel rebar, sand, ready-mix concrete")
        db.add(p_cat)
        db.commit()

        vendor1 = VendorModel(
            vendor_id="VND-2026-01",
            vendor_name="UltraTech Cement Supplies",
            contact_person="Robert Jenkins",
            contact_number="+1 (555) 778-9900",
            email="orders@ultratech.com",
            address="Building 404, Industrial Corridor",
            vendor_category="Raw Materials",
            products_or_services_supplied="Portland OPC Cement 53 Grade",
            vendor_status="Active",
        )
        vendor2 = VendorModel(
            vendor_id="VND-2026-02",
            vendor_name="Apex Structural Steel Ltd.",
            contact_person="Sarah Connor",
            contact_number="+1 (555) 881-2244",
            email="sales@apexsteel.com",
            address="Steel City Zone A",
            vendor_category="Raw Materials",
            products_or_services_supplied="TMT Grade 60 Steel Rebar",
            vendor_status="Active",
        )
        db.add_all([vendor1, vendor2])
        db.commit()

        # Procurement Request 1 (Approved -> Received PO)
        pr_req1 = ProcurementRequestModel(
            request_id="PR-2026-001",
            project_id=p1.id,
            category_name="Raw Materials",
            purpose="Bulk Cement requirement for Level 7-10 floor slab casting",
            priority="High",
            request_date="2026-08-01",
            request_status="Approved",
            requested_by_id=engineer_user.id,
            requested_by_name=engineer_user.full_name,
            approved_by_id=pm_user.id,
            approved_by_name=pm_user.full_name,
            approved_at=datetime.now(timezone.utc),
        )
        db.add(pr_req1)
        db.commit()

        pr_item1 = ProcurementRequestItemModel(
            procurement_request_id=pr_req1.id,
            material_id=m_cem.id,
            item_description="Portland OPC Cement 53 Grade",
            category_name="Cement",
            required_quantity=1000.0,
            available_stock=2000.0,
            net_procurement_quantity=1000.0,
            unit="Bags",
            required_date="2026-08-20",
        )
        db.add(pr_item1)
        db.commit()

        # PO 1: Completed / Received PO
        po1 = PurchaseOrderModel(
            purchase_order_id="PO-2026-001",
            vendor_id=vendor1.id,
            project_id=p1.id,
            procurement_request_id=pr_req1.id,
            order_date="2026-08-05",
            expected_delivery_date="2026-08-15",
            subtotal=350000.0,
            tax_amount=17500.0,
            total_amount=367500.0,
            purchase_order_status="Completed",
            created_by_id=pm_user.id,
            created_by_name=pm_user.full_name,
            approved_by_id=admin_user.id,
            approved_by_name=admin_user.full_name,
        )
        db.add(po1)
        db.commit()

        po_item1 = PurchaseOrderItemModel(
            purchase_order_id=po1.id,
            material_id=m_cem.id,
            description="Portland OPC Cement 53 Grade",
            quantity=1000.0,
            received_quantity=1000.0,
            unit="Bags",
            unit_price=350.0,
            line_total=350000.0,
        )
        db.add(po_item1)
        db.commit()

        # Additional stock movement for received PO
        sm_po = StockMovementModel(
            material_id=m_cem.id,
            project_id=p1.id,
            movement_type="RECEIVED",
            quantity=1000.0,
            movement_date="2026-08-15",
            user_id=admin_user.id,
            user_name=admin_user.full_name,
            reference_id=f"PO-RECEIPT-{po1.purchase_order_id}",
            remarks=f"Received 1000 bags against PO {po1.purchase_order_id}",
        )
        db.add(sm_po)

        inv1 = InvoiceModel(
            invoice_id="INV-2026-001",
            invoice_number="ULT-INV-99410",
            vendor_id=vendor1.id,
            purchase_order_id=po1.id,
            project_id=p1.id,
            invoice_date="2026-08-15",
            due_date="2026-09-15",
            invoice_amount=367500.0,
            payment_status="Paid",
            invoice_status="Verified",
            remarks="Full shipment received & verified against GRN.",
        )
        db.add(inv1)
        db.commit()

        # PO 2: Pending / Ordered PO (Apex Structural Steel)
        pr_req2 = ProcurementRequestModel(
            request_id="PR-2026-002",
            project_id=p1.id,
            category_name="Raw Materials",
            purpose="TMT Steel rebar for Level 7-12 superstructure columns",
            priority="High",
            request_date="2026-08-10",
            request_status="Approved",
            requested_by_id=engineer_user.id,
            requested_by_name=engineer_user.full_name,
            approved_by_id=pm_user.id,
            approved_by_name=pm_user.full_name,
            approved_at=datetime.now(timezone.utc),
        )
        db.add(pr_req2)
        db.commit()

        pr_item2 = ProcurementRequestItemModel(
            procurement_request_id=pr_req2.id,
            material_id=m_stl.id,
            item_description="TMT Rebar 12mm Grade 60",
            category_name="Steel",
            required_quantity=20.0,
            available_stock=80.0,
            net_procurement_quantity=20.0,
            unit="Tons",
            required_date="2026-09-10",
        )
        db.add(pr_item2)

        po2 = PurchaseOrderModel(
            purchase_order_id="PO-2026-002",
            vendor_id=vendor2.id,
            project_id=p1.id,
            procurement_request_id=pr_req2.id,
            order_date="2026-08-12",
            expected_delivery_date="2026-09-05",
            subtotal=420000.0,
            tax_amount=21000.0,
            total_amount=441000.0,
            purchase_order_status="Ordered",
            created_by_id=pm_user.id,
            created_by_name=pm_user.full_name,
            approved_by_id=admin_user.id,
            approved_by_name=admin_user.full_name,
        )
        db.add(po2)
        db.commit()

        po_item2 = PurchaseOrderItemModel(
            purchase_order_id=po2.id,
            material_id=m_stl.id,
            description="TMT Rebar 12mm Grade 60",
            quantity=20.0,
            received_quantity=0.0,
            unit="Tons",
            unit_price=21000.0,
            line_total=420000.0,
        )
        db.add(po_item2)
        db.commit()

        # G. Module 11 – Budget & Cost Management Data
        print("\n[Seeding Module 11] Creating project budget ($85,000,000), 6 category allocations, cost estimates, and actual expenses...")
        pb1 = ProjectBudget(
            project_id=p1.id,
            overall_budget=85000000.0,
            currency="USD",
            notes="Approved baseline budget for Nexus Tech Park Campus.",
            created_by=admin_user.id,
        )
        db.add(pb1)
        db.commit()

        # 6 Allocations summing EXACTLY to $85,00,000
        allocations_p1 = [
            BudgetCategoryAllocation(budget_id=pb1.id, category="Labor", allocated_amount=25000000.0),
            BudgetCategoryAllocation(budget_id=pb1.id, category="Material", allocated_amount=35000000.0),
            BudgetCategoryAllocation(budget_id=pb1.id, category="Equipment", allocated_amount=12000000.0),
            BudgetCategoryAllocation(budget_id=pb1.id, category="Transportation", allocated_amount=5000000.0),
            BudgetCategoryAllocation(budget_id=pb1.id, category="Maintenance", allocated_amount=4000000.0),
            BudgetCategoryAllocation(budget_id=pb1.id, category="Administrative", allocated_amount=4000000.0),
        ]
        db.add_all(allocations_p1)
        db.commit()

        est1 = CostEstimate(
            estimate_code="EST-P1-001",
            project_id=p1.id,
            category="Material",
            amount=3500000.0,
            description="Structural Rebar & OPC Cement Cost Estimate",
            created_by=pm_user.id,
        )
        est2 = CostEstimate(
            estimate_code="EST-P1-002",
            project_id=p1.id,
            category="Labor",
            amount=2500000.0,
            description="Formwork & Structural Slab Casting Labor Estimate",
            created_by=pm_user.id,
        )
        db.add_all([est1, est2])

        # Actual Expenses linked to PO, worker payroll, equipment maintenance
        exp1 = ActualExpense(
            expense_code="EXP-P1-001",
            project_id=p1.id,
            category="Material",
            amount=367500.0,
            description="UltraTech OPC Cement Procurement (PO-2026-001)",
            expense_date="2026-08-05",
            source_reference="PO-2026-001",
            material_id=m_cem.id,
            purchase_order_id=po1.id,
            created_by=pm_user.id,
        )
        exp2 = ActualExpense(
            expense_code="EXP-P1-002",
            project_id=p1.id,
            category="Labor",
            amount=145000.0,
            description="Masonry & Concrete Worker Payroll Period 2026-08",
            expense_date="2026-08-10",
            source_reference="PAY-2026-08",
            worker_id=w1.id,
            created_by=engineer_user.id,
        )
        exp3 = ActualExpense(
            expense_code="EXP-P1-003",
            project_id=p1.id,
            category="Maintenance",
            amount=125000.0,
            description="Excavator Komatsu PC210 Preventive Service",
            expense_date="2026-08-02",
            source_reference="EQP-MAINT-001",
            equipment_id=r1.id,
            created_by=engineer_user.id,
        )
        db.add_all([exp1, exp2, exp3])
        db.commit()

        # H. Module 8 System Notifications
        print("\n[Seeding Module 8] Creating clean system notifications for all 6 core roles...")
        sys_notifs = [
            # Admin Notifications
            Notification(
                user_id=admin_user.id,
                project_id=p1.id,
                title="System Maintenance Completed",
                message="BuildTrack database reset and Module 1-11 dataset synchronization completed successfully.",
                type="SYSTEM",
                category="System",
                is_read=False,
            ),
            Notification(
                user_id=admin_user.id,
                project_id=p1.id,
                title="Executive Oversight Alert",
                message="All 11 modules running on live PostgreSQL database.",
                type="INFO",
                category="System",
                is_read=False,
            ),
            # PM Notifications
            Notification(
                user_id=pm_user.id,
                project_id=p1.id,
                title="Purchase Order Approved & Received",
                message="Purchase Order PO-2026-001 for UltraTech Cement ($367,500.00) has been fully received into stock.",
                type="SUCCESS",
                category="Procurement",
                reference_module="procurement_requests",
                reference_id=po1.id,
                is_read=False,
            ),
            Notification(
                user_id=pm_user.id,
                project_id=p1.id,
                title="Project Schedule Update",
                message="Nexus Tech Park Campus phase 1 substructure milestone reached 100% completion.",
                type="INFO",
                category="Schedule",
                reference_module="projects",
                reference_id=p1.id,
                is_read=False,
            ),
            # Engineer Notifications
            Notification(
                user_id=engineer_user.id,
                project_id=p1.id,
                title="Task Assigned: Column Construction",
                message="Task 'Column Construction (Level 1-6)' is assigned and scheduled for site execution.",
                type="INFO",
                category="Tasks",
                reference_module="tasks",
                reference_id=tasks[2].id,
                is_read=False,
            ),
            Notification(
                user_id=engineer_user.id,
                project_id=p1.id,
                title="Daily Site Progress Log Due",
                message="Please submit today's inspection report for Nexus Tech Park Campus.",
                type="WARNING",
                category="Progress",
                reference_module="site_progress",
                reference_id=p1.id,
                is_read=False,
            ),
            # Contractor Notifications
            Notification(
                user_id=contractor_user.id,
                project_id=p1.id,
                title="New Procurement Order Placed",
                message="Purchase Order PO-2026-002 for Apex Structural Steel ($441,000.00) is currently in status Ordered.",
                type="INFO",
                category="Procurement",
                reference_module="procurement_requests",
                reference_id=po2.id,
                is_read=False,
            ),
            Notification(
                user_id=contractor_user.id,
                project_id=p1.id,
                title="Workforce Shift Assignment",
                message="Structural steel installation crew assigned to Nexus Tech Park Campus.",
                type="INFO",
                category="Workforce",
                reference_module="workforce",
                reference_id=p1.id,
                is_read=False,
            ),
            # Worker Notifications
            Notification(
                user_id=worker_user.id,
                project_id=p1.id,
                title="Shift Assignment Confirmed",
                message="Morning Concrete Shift scheduled at Nexus Tech Park Site.",
                type="INFO",
                category="Attendance",
                reference_module="attendance",
                reference_id=shift1.id,
                is_read=False,
            ),
            Notification(
                user_id=worker_user.id,
                project_id=p1.id,
                title="Safety Gear Requirement",
                message="Mandatory hard hats and high-visibility vests required on site tomorrow.",
                type="WARNING",
                category="Safety",
                reference_module="attendance",
                reference_id=shift1.id,
                is_read=False,
            ),
            # Client Notifications
            Notification(
                user_id=client_user.id,
                project_id=p1.id,
                title="Project Milestone Update",
                message="Milestone 'Site Excavation & Substructure' achieved 100% completion.",
                type="SUCCESS",
                category="Project Update",
                reference_module="projects",
                reference_id=p1.id,
                is_read=False,
            ),
            Notification(
                user_id=client_user.id,
                project_id=p1.id,
                title="Monthly Executive Progress Report",
                message="Monthly progress report available for download under Document Center.",
                type="INFO",
                category="Reports",
                reference_module="reports",
                reference_id=p1.id,
                is_read=False,
            ),
        ]
        db.add_all(sys_notifs)
        db.commit()

        # Step 5: Final Verification Summary
        print("\n==========================================================")
        print("                 FINAL VERIFICATION SUMMARY               ")
        print("==========================================================")

        users_final = db.query(User).all()
        print(f"1. Module 1 Users: {len(users_final)} active system accounts provisioned.")
        for u in users_final:
            print(f"   [OK] ID: {u.id} | Email: {u.email} | Name: {u.full_name} | Designation: {u.designation}")

        proj_count = db.query(Project).count()
        print(f"\n2. Module 2 Projects: {proj_count} Central Project ('{p1.project_name}')")

        dpr_count = db.query(DailyProgressReport).count()
        wpr_count = db.query(WeeklyProgressReport).count()
        del_count = db.query(DelayTracking).count()
        print(f"\n3. Module 3 Site Progress: {dpr_count} Daily Reports | {wpr_count} Weekly Summaries | {del_count} Delays")

        r_count = db.query(ResourceModel).count()
        alloc_count = db.query(ResourceAllocationModel).count()
        print(f"\n4. Module 4 Resources: {r_count} Heavy Equipment Resources | {alloc_count} Active Allocations")

        mat_cnt = db.query(MaterialModel).count()
        req_cnt = db.query(MaterialRequestModel).count()
        mat_alloc_cnt = db.query(MaterialAllocationModel).count()
        mov_cnt = db.query(StockMovementModel).count()
        print(f"\n5. Module 5 Materials: {mat_cnt} Materials | {req_cnt} Material Requests | {mat_alloc_cnt} Allocations | {mov_cnt} Stock Movements")

        wrk_cnt = db.query(Worker).count()
        pay_cnt = db.query(WorkforcePayroll).count()
        print(f"\n6. Module 6 Workforce: {wrk_cnt} Workers | {pay_cnt} Payroll Entries")

        po_cnt = db.query(PurchaseOrderModel).count()
        inv_cnt = db.query(InvoiceModel).count()
        print(f"\n7. Module 7 Procurement: {po_cnt} Purchase Orders (1 Received, 1 Pending) | {inv_cnt} Invoices")

        notif_cnt = db.query(Notification).count()
        print(f"\n8. Module 8 Notifications: {notif_cnt} Notifications in PostgreSQL")

        budg_cnt = db.query(ProjectBudget).count()
        exp_cnt = db.query(ActualExpense).count()
        print(f"\n9. Module 11 Budget & Costs: {budg_cnt} Project Budget ($85M) | {exp_cnt} Actual Expenses")

        print("\nSUCCESS: BuildTrack database reset and Modules 1–11 fresh seeding complete!")

    except Exception as e:
        db.rollback()
        print(f"\n[CRITICAL ERROR] Reset/Seeding failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    clean_and_seed()
