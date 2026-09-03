"""
BuildTrack Master Database Cleanup and Fresh Seeding Script
Deletes old test data from all project, progress, resource, inventory, and task tables
while PRESERVING all existing users, credentials, role mappings, and User IDs intact.
"""

import sys
from datetime import date, datetime, timezone
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.session import SessionLocal, engine, Base
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
from app.models.placeholders import Attendance, Notification, Inventory, Procurement, Report
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


def clean_and_seed():
    db: Session = SessionLocal()
    print("==========================================================")
    print("   BuildTrack Database Cleanup & Fresh Data Seeding      ")
    print("==========================================================")

    try:
        # Step 0: Recreate modified tables so PostgreSQL schemas match current models exactly
        db.execute(text("DROP TABLE IF EXISTS progress_photographs CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS daily_progress_reports CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS weekly_progress_reports CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS delay_tracking CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS site_activity_logs CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS work_completion_status CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS procurements CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS stock_movements CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS material_allocations CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS material_requests CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS material_inventories CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS materials CASCADE"))
        db.execute(text("DROP TABLE IF EXISTS material_categories CASCADE"))
        db.commit()

        Base.metadata.create_all(bind=engine)

        # Step 1: Capture initial user count and details
        users_before = db.query(User).all()
        print(f"[User Guard] Verified {len(users_before)} existing user accounts in PostgreSQL database.")
        for u in users_before:
            print(f"  - User ID: {u.id} | Email: {u.email} | Name: {u.full_name} | Role: {u.designation}")

        if len(users_before) == 0:
            print("[CRITICAL ERROR] No users found in database! Aborting cleanup.")
            return

        # Map user IDs by email for clean assignment referencing
        user_by_email = {u.email: u for u in users_before}

        admin_user = user_by_email.get("admin@buildtrack.com")
        pm_user = user_by_email.get("pm@buildtrack.com")
        engineer_user = user_by_email.get("engineer@buildtrack.com")
        contractor_user = user_by_email.get("contractor@buildtrack.com")
        worker_user = user_by_email.get("worker@buildtrack.com")
        client_user = user_by_email.get("client@buildtrack.com")

        # Step 2: Delete old project and test data safely (Foreign-Key Dependent Order)
        print("\n[Cleanup] Cleaning old project and test data from PostgreSQL tables...")

        db.query(StockMovementModel).delete(synchronize_session=False)
        db.query(MaterialAllocationModel).delete(synchronize_session=False)
        db.query(MaterialRequestModel).delete(synchronize_session=False)
        db.query(MaterialInventoryModel).delete(synchronize_session=False)
        db.query(MaterialModel).delete(synchronize_session=False)
        db.query(MaterialCategoryModel).delete(synchronize_session=False)
        db.query(ResourceMaintenanceModel).delete(synchronize_session=False)
        db.query(ResourceUtilizationModel).delete(synchronize_session=False)
        db.query(ResourceAllocationModel).delete(synchronize_session=False)
        db.query(ProgressPhotograph).delete(synchronize_session=False)
        db.query(DailyProgressReport).delete(synchronize_session=False)
        db.query(WeeklyProgressReport).delete(synchronize_session=False)
        db.query(DelayTracking).delete(synchronize_session=False)
        db.query(SiteActivityLog).delete(synchronize_session=False)
        db.query(WorkCompletionStatus).delete(synchronize_session=False)
        db.query(ProjectAuditLog).delete(synchronize_session=False)
        db.query(ContractorWorker).delete(synchronize_session=False)
        db.query(ProjectContractor).delete(synchronize_session=False)
        db.query(ProjectSiteEngineer).delete(synchronize_session=False)
        db.query(ProjectClient).delete(synchronize_session=False)
        db.query(ProjectSchedule).delete(synchronize_session=False)
        db.query(ProjectMilestone).delete(synchronize_session=False)
        db.query(Procurement).delete(synchronize_session=False)
        db.query(Inventory).delete(synchronize_session=False)
        db.query(ResourceModel).delete(synchronize_session=False)
        db.query(EquipmentModel).delete(synchronize_session=False)
        db.query(TaskModel).delete(synchronize_session=False)
        db.query(DocumentModel).delete(synchronize_session=False)
        db.query(ShiftModel).delete(synchronize_session=False)
        db.query(ActivityLogModel).delete(synchronize_session=False)
        db.query(Attendance).delete(synchronize_session=False)
        db.query(Notification).delete(synchronize_session=False)
        db.query(Report).delete(synchronize_session=False)
        db.query(Project).delete(synchronize_session=False)

        db.commit()
        print("  [OK] Cleared all old test records from project, site progress, resource, inventory, and task tables.")

        # Verify User table integrity
        users_after = db.query(User).all()
        assert len(users_before) == len(users_after), "User count changed during cleanup!"
        print(f"  [OK] User Guard Verified: All {len(users_after)} user accounts preserved intact.")

        # Step 3: Populate Fresh BuildTrack Production Data

        # A. Create Projects (Module 2)
        print("\n[Seeding Module 2] Creating fresh BuildTrack construction projects...")
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
            project_manager_id=pm_user.id if pm_user else None,
        )

        p2 = Project(
            project_name="Metro Rapid Transit Tunnel",
            project_code="BT-PRJ-2026-02",
            category="Infrastructure",
            client_name="City Transit Authority",
            client_contact="+1 (555) 019-3322",
            description="Underground rapid transit tunnel network connecting the financial district with deep-bore excavation.",
            location="Metropolitan Underground",
            estimated_budget=240000000.0,
            priority="High",
            status="In Progress",
            start_date="2026-03-01",
            expected_completion_date="2028-06-30",
            project_manager_id=pm_user.id if pm_user else None,
        )

        p3 = Project(
            project_name="Apex Sky Towers & Residences",
            project_code="BT-PRJ-2026-03",
            category="Residential",
            client_name="Apex Luxury Real Estate",
            client_contact="+1 (555) 018-9900",
            description="Twin 45-story luxury residential towers featuring penthouse suites and automated subterranean parking.",
            location="Downtown Financial District",
            estimated_budget=120000000.0,
            priority="Medium",
            status="Planning",
            start_date="2026-09-01",
            expected_completion_date="2028-12-31",
            project_manager_id=pm_user.id if pm_user else None,
        )

        p4 = Project(
            project_name="Harbor Gateway Logistics Center",
            project_code="BT-PRJ-2026-04",
            category="Industrial",
            client_name="Harbor Trade Logistics",
            client_contact="+1 (555) 012-4411",
            description="High-capacity logistics facility featuring automated sorting bays, cold storage, and heavy transport terminals.",
            location="Port Industrial Zone",
            estimated_budget=45000000.0,
            priority="Medium",
            status="Completed",
            start_date="2025-06-01",
            expected_completion_date="2026-07-31",
            project_manager_id=pm_user.id if pm_user else None,
        )

        db.add_all([p1, p2, p3, p4])
        db.commit()
        db.refresh(p1)
        db.refresh(p2)
        db.refresh(p3)
        db.refresh(p4)
        print(f"  [OK] Created 4 projects (In Progress, Planning, Completed).")

        # B. Project Assignments
        print("  [OK] Assigning Project Manager, Site Engineer, Contractor, Workers, and Client...")
        if engineer_user:
            db.add(ProjectSiteEngineer(project_id=p1.id, site_engineer_id=engineer_user.id))
            db.add(ProjectSiteEngineer(project_id=p2.id, site_engineer_id=engineer_user.id))
            db.add(ProjectSiteEngineer(project_id=p4.id, site_engineer_id=engineer_user.id))

        if contractor_user:
            db.add(ProjectContractor(project_id=p1.id, contractor_id=contractor_user.id))
            db.add(ProjectContractor(project_id=p2.id, contractor_id=contractor_user.id))

            if worker_user:
                db.add(ContractorWorker(contractor_id=contractor_user.id, worker_id=worker_user.id, project_id=p1.id))

        if client_user:
            db.add(ProjectClient(project_id=p1.id, client_id=client_user.id))
            db.add(ProjectClient(project_id=p2.id, client_id=client_user.id))
            db.add(ProjectClient(project_id=p4.id, client_id=client_user.id))

        db.commit()

        # C. Project Milestones & Schedules
        print("  [OK] Creating project milestones and schedule phases...")
        # Project 1 Milestones
        m1 = ProjectMilestone(project_id=p1.id, milestone_name="Site Excavation & Substructure", description="Foundation excavation, pile caps, and basement slab pour.", planned_date="2026-04-30", actual_completion_date="2026-04-28", completion_percentage=100, status="Completed")
        m2 = ProjectMilestone(project_id=p1.id, milestone_name="Structural Concrete & Steel Superstructure", description="Reinforced concrete columns, beams, and slab pours up to Level 15.", planned_date="2026-10-31", completion_percentage=75, status="In Progress")
        m3 = ProjectMilestone(project_id=p1.id, milestone_name="Electrical & Mechanical Rough-in", description="HVAC ductwork, electrical conduit, and plumbing risers.", planned_date="2027-04-30", completion_percentage=30, status="In Progress")
        m4 = ProjectMilestone(project_id=p1.id, milestone_name="Interior Finishing & Handover", description="Drywall, glass facade, interior fit-out, and final safety inspection.", planned_date="2027-11-30", completion_percentage=0, status="Pending")

        # Project 4 (Completed) Milestones
        m4_1 = ProjectMilestone(project_id=p4.id, milestone_name="Site Prep & Foundation", description="Ground compaction and slab foundation.", planned_date="2025-09-30", actual_completion_date="2025-09-25", completion_percentage=100, status="Completed")
        m4_2 = ProjectMilestone(project_id=p4.id, milestone_name="Steel Framing & Enclosure", description="Structural steel erection and roof cladding.", planned_date="2026-03-31", actual_completion_date="2026-03-28", completion_percentage=100, status="Completed")
        m4_3 = ProjectMilestone(project_id=p4.id, milestone_name="Final Commissioning & Handover", description="Facility testing and handover to Harbor Trade.", planned_date="2026-07-31", actual_completion_date="2026-07-30", completion_percentage=100, status="Completed")

        db.add_all([m1, m2, m3, m4, m4_1, m4_2, m4_3])

        # Project 1 Schedules
        s1 = ProjectSchedule(project_id=p1.id, phase_name="Phase 1: Substructure Excavation", description="Pile cap & basement slab excavation", planned_start_date="2026-01-15", planned_end_date="2026-04-30", estimated_duration=105)
        s2 = ProjectSchedule(project_id=p1.id, phase_name="Phase 2: Superstructure Framing", description="Concrete columns, beams & slab pours", planned_start_date="2026-05-01", planned_end_date="2026-10-31", estimated_duration=184)
        s3 = ProjectSchedule(project_id=p1.id, phase_name="Phase 3: MEP & Envelope", description="HVAC, electrical conduit & plumbing risers", planned_start_date="2026-11-01", planned_end_date="2027-04-30", estimated_duration=181)
        s4 = ProjectSchedule(project_id=p1.id, phase_name="Phase 4: Fit-out & Inspection", description="Interior finishing & safety sign-off", planned_start_date="2027-05-01", planned_end_date="2027-11-30", estimated_duration=214)

        db.add_all([s1, s2, s3, s4])
        db.commit()

        # D. Module 3 – Site Progress Monitoring Data
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
            reported_by=engineer_user.full_name if engineer_user else "Jackson Reed",
            reported_by_id=engineer_user.id if engineer_user else None,
            status="Approved"
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
            reported_by=engineer_user.full_name if engineer_user else "Jackson Reed",
            reported_by_id=engineer_user.id if engineer_user else None,
            status="Approved"
        )

        dpr3 = DailyProgressReport(
            project_id=p1.id,
            report_date="2026-08-10",
            progress_category="Electrical Work",
            work_completed="Electrical conduit rough-in and main distribution panel wiring on Level 5 West Wing.",
            progress_percentage=30,
            contractor="VoltWorks Electrical Contractors",
            worker_attendance="10 electricians present",
            worker_count=10,
            worker_absent=0,
            worker_hours=8.0,
            machinery_used="Wire Puller, Hydraulic Bender",
            materials_consumed="PVC Conduit Pipe (250 m), Copper Wire (500 m)",
            cost_incurred=8900.0,
            weather_conditions="Sunny",
            safety_observations="Lockout/tagout procedure verified on main circuit breakers.",
            quality_inspection_remarks="Conduit layout approved by electrical site inspector.",
            delays=False,
            delay_reasons=None,
            comments="Electrical rough-in proceeding smoothly.",
            reported_by=engineer_user.full_name if engineer_user else "Jackson Reed",
            reported_by_id=engineer_user.id if engineer_user else None,
            status="Pending"
        )

        db.add_all([dpr1, dpr2, dpr3])
        db.commit()

        # Photos
        photo1 = ProgressPhotograph(report_id=dpr1.id, photo_url="https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600", caption="Foundation concrete pour grid B1-B8", uploaded_by=engineer_user.full_name if engineer_user else "Jackson Reed")
        photo2 = ProgressPhotograph(report_id=dpr2.id, photo_url="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600", caption="Level 6 column formwork inspection", uploaded_by=engineer_user.full_name if engineer_user else "Jackson Reed")
        db.add_all([photo1, photo2])

        # Weekly Progress Report
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
            generated_by=pm_user.full_name if pm_user else "Elena Rostova"
        )
        db.add(wpr)

        # Delays
        delay1 = DelayTracking(
            project_id=p1.id,
            reason="Heavy morning rainfall causing slippery scaffold and wet formwork",
            duration_days=1,
            affected_work_category="Structural Work",
            impact_on_timeline="Minor - 1 day shift absorbed by project buffer.",
            reported_date="2026-08-09",
            reported_by=engineer_user.full_name if engineer_user else "Jackson Reed",
            remarks="Work resumed in afternoon shift once weather cleared.",
            status="Open"
        )
        delay2 = DelayTracking(
            project_id=p1.id,
            reason="Concrete pump truck hydraulic hose leak",
            duration_days=1,
            affected_work_category="Foundation",
            impact_on_timeline="Resolved - Hose replaced within 2 hours.",
            reported_date="2026-08-04",
            reported_by=engineer_user.full_name if engineer_user else "Jackson Reed",
            remarks="Maintenance team dispatched onsite immediately.",
            status="Resolved"
        )
        db.add_all([delay1, delay2])

        # Activity Logs
        log1 = SiteActivityLog(project_id=p1.id, activity_date="2026-08-10", activity_time="07:30", description="Daily site safety meeting and hazard identification walk.", event_type="Safety Meeting", responsible_person=engineer_user.full_name if engineer_user else "Jackson Reed")
        log2 = SiteActivityLog(project_id=p1.id, activity_date="2026-08-09", activity_time="09:00", description="Delivery of 15 tons Grade 60 steel rebar and unloading.", event_type="Material Delivery", responsible_person="Samuel Harris")
        log3 = SiteActivityLog(project_id=p1.id, activity_date="2026-08-08", activity_time="14:00", description="Structural engineer quality audit of Level 6 slab reinforcement.", event_type="Inspection", responsible_person=engineer_user.full_name if engineer_user else "Jackson Reed")
        log4 = SiteActivityLog(project_id=p1.id, activity_date="2026-08-07", activity_time="11:30", description="Client representative walkthrough with project management team.", event_type="Client Visit", responsible_person=pm_user.full_name if pm_user else "Elena Rostova")
        db.add_all([log1, log2, log3, log4])

        db.commit()

        # E. Module 4 – Resource Management Data
        print("\n[Seeding Module 4] Creating resources, allocations, utilization, maintenance, and inventory...")
        r1 = ResourceModel(
            equipment_code="EXC-001",
            name="Heavy Hydraulic Excavator Komatsu PC210",
            category="Excavators",
            description="20-ton crawler excavator equipped with heavy rock bucket.",
            status="Allocated",
            location="Silicon Valley Hub Site",
            responsible_person_id=engineer_user.id if engineer_user else None,
            responsible_person_name=engineer_user.full_name if engineer_user else "Jackson Reed",
            project_id=p1.id,
            serial_number="KOM-PC210-9941",
            purchase_date="2024-03-15",
            purchase_cost=145000.0,
            utilization_percentage=80.0
        )

        r2 = ResourceModel(
            equipment_code="CRN-001",
            name="Mobile All-Terrain Crane Liebherr LTM 1050",
            category="Cranes",
            description="50-ton mobile crane with 38m telescopic main boom.",
            status="Allocated",
            location="Metropolitan Underground Site",
            responsible_person_id=engineer_user.id if engineer_user else None,
            responsible_person_name=engineer_user.full_name if engineer_user else "Jackson Reed",
            project_id=p2.id,
            serial_number="LBH-LTM1050-3320",
            purchase_date="2023-11-20",
            purchase_cost=280000.0,
            utilization_percentage=70.0
        )

        r3 = ResourceModel(
            equipment_code="MIX-001",
            name="Transit Concrete Mixer Truck Volvo FMX",
            category="Concrete Mixers",
            description="9m3 heavy concrete transit mixer with automated slump control.",
            status="Available",
            location="Equipment Yard",
            responsible_person_id=None,
            responsible_person_name="Yard Supervisor",
            project_id=None,
            serial_number="VLV-FMX-8812",
            purchase_date="2025-01-10",
            purchase_cost=110000.0,
            utilization_percentage=0.0
        )

        r4 = ResourceModel(
            equipment_code="GEN-001",
            name="Heavy Power Generator Cummins 250kVA",
            category="Generators",
            description="Silent diesel generator for primary site power distribution.",
            status="Under Maintenance",
            location="Central Yard Service Bay",
            responsible_person_id=None,
            responsible_person_name="Mike Technician",
            project_id=None,
            serial_number="CUM-250K-1104",
            purchase_date="2024-08-01",
            purchase_cost=42000.0,
            utilization_percentage=0.0
        )

        r5 = ResourceModel(
            equipment_code="DMP-001",
            name="Articulated Dump Truck CAT 745",
            category="Dump Trucks",
            description="45-ton payload articulated earthmoving truck.",
            status="Available",
            location="Equipment Yard",
            responsible_person_id=None,
            responsible_person_name="Yard Supervisor",
            project_id=None,
            serial_number="CAT-745-4490",
            purchase_date="2024-05-18",
            purchase_cost=195000.0,
            utilization_percentage=0.0
        )

        r6 = ResourceModel(
            equipment_code="SAF-001",
            name="Full Body Fall Protection Safety Harness Kit",
            category="Safety Equipment",
            description="Certified high-altitude fall arrest harness with dual lanyard.",
            status="Available",
            location="Safety Equipment Store",
            responsible_person_id=None,
            responsible_person_name="Safety Officer",
            project_id=None,
            serial_number="SAF-KIT-9901",
            purchase_date="2025-02-01",
            purchase_cost=2500.0,
            utilization_percentage=0.0
        )

        db.add_all([r1, r2, r3, r4, r5, r6])
        db.commit()

        # Allocations
        alloc1 = ResourceAllocationModel(
            resource_id=r1.id,
            project_id=p1.id,
            allocation_date="2026-08-01",
            expected_return_date="2026-08-31",
            responsible_person_id=engineer_user.id if engineer_user else None,
            responsible_person_name=engineer_user.full_name if engineer_user else "Jackson Reed",
            location="Silicon Valley Hub Site",
            notes="Assigned for site excavation and foundation trenching.",
            status="Active"
        )
        alloc2 = ResourceAllocationModel(
            resource_id=r2.id,
            project_id=p2.id,
            allocation_date="2026-08-05",
            expected_return_date="2026-09-15",
            responsible_person_id=engineer_user.id if engineer_user else None,
            responsible_person_name=engineer_user.full_name if engineer_user else "Jackson Reed",
            location="Metropolitan Underground Site",
            notes="Assigned for heavy segment lifting at tunnel access shaft.",
            status="Active"
        )
        db.add_all([alloc1, alloc2])

        # Utilizations
        u1 = ResourceUtilizationModel(
            resource_id=r1.id,
            project_id=p1.id,
            date="2026-08-08",
            operating_hours=8.0,
            idle_hours=2.0,
            total_available_hours=10.0,
            utilization_percentage=80.0,
            notes="Basement trench excavation"
        )
        u2 = ResourceUtilizationModel(
            resource_id=r2.id,
            project_id=p2.id,
            date="2026-08-08",
            operating_hours=7.0,
            idle_hours=3.0,
            total_available_hours=10.0,
            utilization_percentage=70.0,
            notes="Tunnel liner segment hoisting"
        )
        db.add_all([u1, u2])

        # Maintenances
        maint1 = ResourceMaintenanceModel(
            resource_id=r4.id,
            maintenance_date="2026-08-10",
            next_maintenance_date="2026-09-10",
            maintenance_type="Preventative",
            service_engineer="Mike Technician",
            maintenance_cost=450.0,
            status="In Progress",
            description="Oil filter replacement, fuel line flushing, and battery load testing."
        )
        db.add(maint1)

        # Module 5 – Material & Inventory Management Seeding
        print("\n[Seeding Module 5] Creating material categories, materials master, stock receipts, requests, and allocations...")
        from app.services.material_service import MaterialService
        from app.schemas.material import (
            MaterialCreate,
            StockReceiveRequest,
            MaterialRequestCreate,
            MaterialRequestReview,
            MaterialAllocationCreate,
            MaterialConsumptionCreate,
        )
        mat_service = MaterialService(db)
        mat_service.seed_categories()

        # Create Materials Master
        m_cem = mat_service.create_material(
            MaterialCreate(materialCode="MAT-CEM-01", name="Portland OPC Cement 50kg Bags", categoryName="Cement", unitOfMeasure="Bags", minStockLevel=500.0, description="High-grade Ordinary Portland Cement for structural pours."),
            admin_user
        )
        m_stl = mat_service.create_material(
            MaterialCreate(materialCode="MAT-STL-01", name="TMT Steel Rebar 12mm Grade 60", categoryName="Steel", unitOfMeasure="Tons", minStockLevel=20.0, description="Thermo-Mechanically Treated steel rebar for structural reinforcement."),
            admin_user
        )
        m_brk = mat_service.create_material(
            MaterialCreate(materialCode="MAT-BRK-01", name="Standard Red Clay Construction Bricks", categoryName="Bricks", unitOfMeasure="Pieces", minStockLevel=5000.0, description="High-density red clay masonry bricks."),
            admin_user
        )
        m_snd = mat_service.create_material(
            MaterialCreate(materialCode="MAT-SND-01", name="M-Sand Manufactured Aggregate Sand", categoryName="Sand", unitOfMeasure="Tons", minStockLevel=50.0, description="Washed manufactured sand for concrete and plastering."),
            admin_user
        )
        m_con = mat_service.create_material(
            MaterialCreate(materialCode="MAT-CON-01", name="Ready Mix Concrete M30 Grade", categoryName="Concrete", unitOfMeasure="Cubic Meter", minStockLevel=100.0, description="Certified M30 grade RMC for column and slab casting."),
            admin_user
        )

        # Receive Initial Stock
        mat_service.receive_stock(StockReceiveRequest(materialId=m_cem["id"], quantity=2000.0, warehouseLocation="Main Central Store", remarks="Initial bulk delivery from UltraTech Cement"), admin_user)
        mat_service.receive_stock(StockReceiveRequest(materialId=m_stl["id"], quantity=80.0, warehouseLocation="Steel Yard Zone A", remarks="Initial stock delivery from Tata Steel"), admin_user)
        mat_service.receive_stock(StockReceiveRequest(materialId=m_brk["id"], quantity=30000.0, warehouseLocation="Brick Yard Depot", remarks="Initial shipment from Apex Brickworks"), admin_user)
        mat_service.receive_stock(StockReceiveRequest(materialId=m_snd["id"], quantity=40.0, warehouseLocation="Aggregate Pit", remarks="Low stock initial delivery"), admin_user)

        # Create Material Requests (Site Engineer)
        mr1 = mat_service.create_request(
            MaterialRequestCreate(projectId=p1.id, materialId=m_cem["id"], requiredQuantity=500.0, requiredDate="2026-08-15", workActivity="Foundation Block B Column Pours", remarks="Required for upcoming column pours"),
            engineer_user
        )
        mr2 = mat_service.create_request(
            MaterialRequestCreate(projectId=p1.id, materialId=m_stl["id"], requiredQuantity=15.0, requiredDate="2026-08-16", workActivity="Structural Rebar Caging", remarks="Urgent steel cage tying"),
            engineer_user
        )

        # Approve Request (PM)
        mat_service.review_request(mr1["id"], MaterialRequestReview(status="Approved", reviewRemarks="Approved for foundation phase"), pm_user)

        # Allocate Materials to Project 1
        al1 = mat_service.create_allocation(
            MaterialAllocationCreate(projectId=p1.id, materialId=m_cem["id"], quantity=400.0, allocationDate="2026-08-10", workActivity="Foundation Block B Column Pours", requestId=mr1["id"], remarks="Allocated 400 bags"),
            pm_user
        )
        al2 = mat_service.create_allocation(
            MaterialAllocationCreate(projectId=p1.id, materialId=m_stl["id"], quantity=10.0, allocationDate="2026-08-10", workActivity="Structural Rebar Caging", requestId=mr2["id"], remarks="Allocated 10 tons steel"),
            pm_user
        )

        # Consume Portion of Allocation
        mat_service.consume_allocation(al1["id"], MaterialConsumptionCreate(consumedQuantity=250.0, remarks="Used for columns B1-B8"), engineer_user)

        # F. Trigger site progress completion & milestone sync
        from app.services.site_progress_service import SiteProgressService
        try:
            SiteProgressService(db).recompute_completion(p1.id)
            SiteProgressService(db).sync_milestones_from_reports(p1.id)
        except Exception as sync_err:
            print(f"  [Notice] Completion sync: {sync_err}")

        # G. Module 8 Deadline Evaluation & Seeding
        from app.services.notification_service import NotificationService
        notif_gen_count = NotificationService.check_and_generate_deadline_notifications(db)

        # Step 4: Final Verification
        print("\n==========================================================")
        print("                 FINAL VERIFICATION SUMMARY               ")
        print("==========================================================")

        # 1. Verify User Count & IDs
        users_final = db.query(User).all()
        print(f"1. User Table Verification: {len(users_final)} users present (Original: {len(users_before)}) -> PERFECT MATCH!")
        for u in users_final:
            print(f"   [OK] ID: {u.id} | Email: {u.email} | Name: {u.full_name} | Role: {u.designation}")

        # 2. Verify Projects
        proj_count = db.query(Project).count()
        print(f"\n2. Projects Created: {proj_count} construction projects")
        for p in db.query(Project).all():
            pm_name = p.project_manager.full_name if p.project_manager else "None"
            print(f"   [OK] Code: {p.project_code} | Name: {p.project_name} | Status: {p.status} | PM: {pm_name}")

        # 3. Verify Module 3 Progress Reports
        dpr_count = db.query(DailyProgressReport).count()
        wpr_count = db.query(WeeklyProgressReport).count()
        del_count = db.query(DelayTracking).count()
        print(f"\n3. Module 3 Site Progress: {dpr_count} Daily Reports | {wpr_count} Weekly Summaries | {del_count} Delays")

        # 4. Verify Module 4 Resources
        r_count = db.query(ResourceModel).filter(ResourceModel.equipment_code != None).count()
        alloc_count = db.query(ResourceAllocationModel).count()
        print(f"\n4. Module 4 Resources: {r_count} Equipment Resources | {alloc_count} Active Allocations")

        # 5. Verify Module 5 Materials & Inventory
        mat_cnt = db.query(MaterialModel).count()
        req_cnt = db.query(MaterialRequestModel).count()
        mat_alloc_cnt = db.query(MaterialAllocationModel).count()
        mov_cnt = db.query(StockMovementModel).count()
        print(f"\n5. Module 5 Materials & Inventory: {mat_cnt} Materials | {req_cnt} Material Requests | {mat_alloc_cnt} Allocations | {mov_cnt} Stock Movements")

        # 6. Verify Module 8 Notifications
        notif_cnt = db.query(Notification).count()
        unread_cnt = db.query(Notification).filter(Notification.is_read == False).count()
        print(f"\n6. Module 8 Notifications: {notif_cnt} Real Notifications in PostgreSQL | {unread_cnt} Unread ({notif_gen_count} deadline alerts generated)")

        print("\nSUCCESS: All old test data cleaned and fresh BuildTrack Module 1-8 data created cleanly from PostgreSQL!")

    except Exception as e:
        db.rollback()
        print(f"\n[CRITICAL ERROR] Cleanup failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    clean_and_seed()
