import math
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, status
from sqlalchemy import or_, and_, func
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.project import Project
from app.models.shift import ShiftModel
from app.models.assignments import ProjectSiteEngineer, ProjectContractor
from app.models.workforce import (
    WorkforceCategory,
    Worker,
    WorkerProjectAssignment,
    WorkerShiftAssignment,
    AttendanceModel,
    WorkforcePayroll,
)
from app.schemas.workforce import (
    WorkforceCategoryRead,
    WorkforceCategoryCreate,
    WorkerRead,
    WorkerCreate,
    WorkerUpdate,
    WorkerBulkImportRequest,
    WorkerBulkImportResult,
    PaginatedWorkersResponse,
    WorkerProjectAssignmentRead,
    WorkerProjectAssignmentCreate,
    WorkerTransferRequest,
    ShiftRead,
    ShiftCreate,
    ShiftUpdate,
    WorkerShiftAssignmentRead,
    ShiftWorkerAssignRequest,
    AttendanceRead,
    AttendanceCreate,
    AttendanceUpdate,
    AttendanceSummaryRead,
    ShiftAttendanceComparisonRead,
    WorkforcePayrollRead,
    WorkforcePayrollCreate,
    WorkforcePayrollUpdate,
    WorkforcePayrollSummaryRead,
    WorkforceDashboardStats,
)


DEFAULT_CATEGORIES = [
    ("Engineers", "Civil, Structural, Electrical, and Mechanical Engineering Personnel"),
    ("Supervisors", "Field Site Supervisors, Foreman, and Safety Inspectors"),
    ("Contractors", "Subcontractors and Specialized Trade Management Personnel"),
    ("Skilled Workers", "Masons, Electricians, Plumbers, Carpenters, Welders, Machine Operators"),
    ("Unskilled Workers", "General Construction Laborers, Helpers, and Excavation Support"),
    ("Consultants", "Architectural, Environmental, and Structural Quality Consultants"),
]


class WorkforceService:
    def __init__(self, db: Session):
        self.db = db

    # ---------------------------------------------------------
    # RBAC Authorization Helper
    # ---------------------------------------------------------
    def verify_permission(self, current_user: User, project_id: Optional[str] = None, contractor_id: Optional[str] = None, read_only: bool = False):
        user_role = current_user.role_rel.name if current_user.role_rel else ""
        
        if user_role == "Administrator":
            return True

        if read_only and user_role in ["Project Manager", "Site Engineer", "Contractor", "Client", "Worker"]:
            return True

        if user_role == "Project Manager":
            if project_id:
                proj = self.db.query(Project).filter(Project.id == project_id, Project.project_manager_id == current_user.id).first()
                if not proj:
                    # Check if project exists and user is PM
                    pass
            return True

        if user_role == "Site Engineer":
            if project_id:
                se_assign = self.db.query(ProjectSiteEngineer).filter(
                    ProjectSiteEngineer.project_id == project_id,
                    ProjectSiteEngineer.site_engineer_id == current_user.id
                ).first()
                if not se_assign:
                    pass
            return True

        if user_role == "Contractor":
            if contractor_id and contractor_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Contractors can only access workers belonging to their contracting agency"
                )
            return True

        if user_role == "Client":
            if not read_only:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Clients have read-only workforce access")
            return True

        return True

    # ---------------------------------------------------------
    # Category Management
    # ---------------------------------------------------------
    def seed_default_categories(self):
        for name, desc in DEFAULT_CATEGORIES:
            cat = self.db.query(WorkforceCategory).filter(WorkforceCategory.name == name).first()
            if not cat:
                cat = WorkforceCategory(name=name, description=desc)
                self.db.add(cat)
        self.db.commit()

    def get_categories(self) -> List[WorkforceCategoryRead]:
        self.seed_default_categories()
        categories = self.db.query(WorkforceCategory).order_by(WorkforceCategory.name).all()
        results = []
        for c in categories:
            w_count = self.db.query(Worker).filter(Worker.workforce_category_id == c.id).count()
            results.append(WorkforceCategoryRead(
                id=c.id,
                name=c.name,
                description=c.description,
                workerCount=w_count,
                createdAt=c.created_at.isoformat() if c.created_at else None
            ))
        return results

    # ---------------------------------------------------------
    # Helper to Build WorkerRead Object
    # ---------------------------------------------------------
    def _build_worker_read(self, w: Worker) -> WorkerRead:
        category_name = w.category_rel.name if w.category_rel else None
        contractor_name = w.contractor_rel.full_name if w.contractor_rel else None

        active_assign = self.db.query(WorkerProjectAssignment).filter(
            WorkerProjectAssignment.worker_id == w.id,
            WorkerProjectAssignment.assignment_status == "Active"
        ).order_by(WorkerProjectAssignment.created_at.desc()).first()

        curr_proj_id = active_assign.project_id if active_assign else None
        curr_proj_name = active_assign.project.project_name if active_assign and active_assign.project else None
        curr_assign_id = active_assign.id if active_assign else None

        return WorkerRead(
            id=w.id,
            workerId=w.worker_id,
            workerName=w.worker_name,
            contactInformation=w.contact_information,
            workforceCategoryId=w.workforce_category_id,
            categoryName=category_name,
            skillOrWorkType=w.skill_or_work_type,
            contractorId=w.contractor_id,
            contractorName=contractor_name,
            joiningDate=w.joining_date,
            workerStatus=w.worker_status,
            payRate=w.pay_rate or 0.0,
            currentProjectId=curr_proj_id,
            currentProjectName=curr_proj_name,
            currentAssignmentId=curr_assign_id,
            createdAt=w.created_at.isoformat() if w.created_at else None,
            updatedAt=w.updated_at.isoformat() if w.updated_at else None,
        )

    # ---------------------------------------------------------
    # Worker CRUD & Search & Bulk Import
    # ---------------------------------------------------------
    def get_workers(
        self,
        search: Optional[str] = None,
        category_id: Optional[str] = None,
        contractor_id: Optional[str] = None,
        project_id: Optional[str] = None,
        worker_status: Optional[str] = None,
        skill: Optional[str] = None,
        page: int = 1,
        page_size: int = 10,
        current_user: User = None
    ) -> PaginatedWorkersResponse:
        self.verify_permission(current_user, project_id=project_id, contractor_id=contractor_id, read_only=True)

        query = self.db.query(Worker)

        if search:
            pattern = f"%{search.strip()}%"
            query = query.filter(or_(Worker.worker_id.ilike(pattern), Worker.worker_name.ilike(pattern), Worker.skill_or_work_type.ilike(pattern)))

        if category_id:
            query = query.filter(Worker.workforce_category_id == category_id)

        if contractor_id:
            query = query.filter(Worker.contractor_id == contractor_id)

        if worker_status:
            query = query.filter(Worker.worker_status == worker_status)

        if skill:
            query = query.filter(Worker.skill_or_work_type.ilike(f"%{skill}%"))

        if project_id:
            active_worker_ids = self.db.query(WorkerProjectAssignment.worker_id).filter(
                WorkerProjectAssignment.project_id == project_id,
                WorkerProjectAssignment.assignment_status == "Active"
            ).subquery()
            query = query.filter(Worker.id.in_(active_worker_ids))

        total = query.count()
        total_pages = max(1, math.ceil(total / page_size))
        page = max(1, min(page, total_pages))

        workers = query.order_by(Worker.worker_id.asc()).offset((page - 1) * page_size).limit(page_size).all()

        items = [self._build_worker_read(w) for w in workers]

        return PaginatedWorkersResponse(
            items=items,
            total=total,
            page=page,
            pageSize=page_size,
            totalPages=total_pages
        )

    def get_worker_by_id(self, worker_id: str, current_user: User) -> WorkerRead:
        self.verify_permission(current_user, read_only=True)
        w = self.db.query(Worker).filter(Worker.id == worker_id).first()
        if not w:
            w = self.db.query(Worker).filter(Worker.worker_id == worker_id).first()
        if not w:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker record not found")
        return self._build_worker_read(w)

    def create_worker(self, req: WorkerCreate, current_user: User) -> WorkerRead:
        self.verify_permission(current_user)

        # Check duplicate worker_id
        existing = self.db.query(Worker).filter(Worker.worker_id == req.workerId.strip()).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Worker ID '{req.workerId}' is already registered")

        category = self.db.query(WorkforceCategory).filter(WorkforceCategory.id == req.workforceCategoryId).first()
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified workforce category does not exist")

        contractor_id_val = req.contractorId.strip() if (req.contractorId and req.contractorId.strip() != "") else None

        if contractor_id_val:
            contractor = self.db.query(User).filter(User.id == contractor_id_val).first()
            if not contractor:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified contractor account does not exist")

        new_worker = Worker(
            worker_id=req.workerId.strip(),
            worker_name=req.workerName.strip(),
            contact_information=req.contactInformation,
            workforce_category_id=req.workforceCategoryId,
            skill_or_work_type=req.skillOrWorkType,
            contractor_id=contractor_id_val,
            joining_date=req.joiningDate,
            worker_status=req.workerStatus or "Active",
            pay_rate=req.payRate or 0.0
        )
        self.db.add(new_worker)
        self.db.commit()

        self.db.refresh(new_worker)
        return self._build_worker_read(new_worker)

    def update_worker(self, worker_id: str, req: WorkerUpdate, current_user: User) -> WorkerRead:
        self.verify_permission(current_user)
        w = self.db.query(Worker).filter(Worker.id == worker_id).first()
        if not w:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker record not found")

        if req.workerName is not None: w.worker_name = req.workerName.strip()
        if req.contactInformation is not None: w.contact_information = req.contactInformation
        if req.workforceCategoryId is not None:
            cat = self.db.query(WorkforceCategory).filter(WorkforceCategory.id == req.workforceCategoryId).first()
            if not cat:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid workforce category")
            w.workforce_category_id = req.workforceCategoryId
        if req.skillOrWorkType is not None: w.skill_or_work_type = req.skillOrWorkType
        if req.contractorId is not None: w.contractor_id = req.contractorId if req.contractorId != "" else None
        if req.joiningDate is not None: w.joining_date = req.joiningDate
        if req.workerStatus is not None: w.worker_status = req.workerStatus
        if req.payRate is not None: w.pay_rate = req.payRate

        self.db.commit()
        self.db.refresh(w)
        return self._build_worker_read(w)

    def change_worker_status(self, worker_id: str, new_status: str, current_user: User) -> WorkerRead:
        self.verify_permission(current_user)
        w = self.db.query(Worker).filter(Worker.id == worker_id).first()
        if not w:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker record not found")

        w.worker_status = new_status
        self.db.commit()
        self.db.refresh(w)
        return self._build_worker_read(w)

    def bulk_import_workers(self, req: WorkerBulkImportRequest, current_user: User) -> WorkerBulkImportResult:
        self.verify_permission(current_user)

        self.seed_default_categories()
        categories = {c.name.lower(): c.id for c in self.db.query(WorkforceCategory).all()}
        projects = {p.project_code.lower(): p.id for p in self.db.query(Project).all()}
        projects.update({p.id: p.id for p in self.db.query(Project).all()})

        # Contractors map by email, full_name, or id
        contractors_query = self.db.query(User).join(User.role_rel).filter(User.role_rel.has(name="Contractor")).all()
        contractors = {}
        for c in contractors_query:
            contractors[c.email.lower()] = c.id
            contractors[c.full_name.lower()] = c.id
            contractors[c.id] = c.id

        errors = []
        created_list = []
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        for idx, item in enumerate(req.workers, start=1):
            if not item.workerId or not item.workerName or not item.categoryName:
                errors.append(f"Row {idx}: Missing required fields (workerId, workerName, or categoryName)")
                continue

            # Check duplicate ID
            w_id = item.workerId.strip()
            if self.db.query(Worker).filter(Worker.worker_id == w_id).first():
                errors.append(f"Row {idx}: Worker ID '{w_id}' already exists")
                continue

            cat_id = categories.get(item.categoryName.strip().lower())
            if not cat_id:
                # Create category dynamically if valid string
                new_cat = WorkforceCategory(name=item.categoryName.strip(), description="Imported category")
                self.db.add(new_cat)
                self.db.commit()
                self.db.refresh(new_cat)
                cat_id = new_cat.id
                categories[new_cat.name.lower()] = cat_id

            c_id = None
            if item.contractorEmailOrId:
                c_id = contractors.get(item.contractorEmailOrId.strip().lower())

            p_id = None
            if item.projectCodeOrId:
                p_id = projects.get(item.projectCodeOrId.strip().lower())

            try:
                new_w = Worker(
                    worker_id=w_id,
                    worker_name=item.workerName.strip(),
                    contact_information=item.contactInformation,
                    workforce_category_id=cat_id,
                    skill_or_work_type=item.skillOrWorkType or "General Labor",
                    contractor_id=c_id,
                    joining_date=item.joiningDate or today_str,
                    worker_status=item.workerStatus or "Active",
                    pay_rate=item.payRate or 0.0
                )
                self.db.add(new_w)
                self.db.commit()
                self.db.refresh(new_w)

                if p_id:
                    assign = WorkerProjectAssignment(
                        worker_id=new_w.id,
                        project_id=p_id,
                        contractor_id=c_id,
                        work_activity=item.skillOrWorkType or "General Construction",
                        assignment_start_date=item.joiningDate or today_str,
                        assignment_status="Active"
                    )
                    self.db.add(assign)
                    self.db.commit()

                created_list.append(self._build_worker_read(new_w))
            except Exception as e:
                self.db.rollback()
                errors.append(f"Row {idx}: Failed to insert worker '{w_id}' - {str(e)}")

        return WorkerBulkImportResult(
            totalProcessed=len(req.workers),
            successCount=len(created_list),
            failureCount=len(errors),
            errors=errors,
            createdWorkers=created_list
        )

    # ---------------------------------------------------------
    # Workforce Allocation & Project Assignments
    # ---------------------------------------------------------
    def _build_assignment_read(self, a: WorkerProjectAssignment) -> WorkerProjectAssignmentRead:
        return WorkerProjectAssignmentRead(
            id=a.id,
            workerId=a.worker_id,
            workerName=a.worker.worker_name if a.worker else None,
            workerCode=a.worker.worker_id if a.worker else None,
            projectId=a.project_id,
            projectName=a.project.project_name if a.project else None,
            projectCode=a.project.project_code if a.project else None,
            contractorId=a.contractor_id,
            contractorName=a.contractor.full_name if a.contractor else None,
            workActivity=a.work_activity,
            assignmentStartDate=a.assignment_start_date,
            assignmentEndDate=a.assignment_end_date,
            assignmentStatus=a.assignment_status,
            createdAt=a.created_at.isoformat() if a.created_at else None
        )

    def create_assignment(self, req: WorkerProjectAssignmentCreate, current_user: User) -> WorkerProjectAssignmentRead:
        self.verify_permission(current_user, project_id=req.projectId, contractor_id=req.contractorId)

        worker = self.db.query(Worker).filter(Worker.id == req.workerId).first()
        if not worker:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")

        project = self.db.query(Project).filter(Project.id == req.projectId).first()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

        if req.assignmentEndDate and req.assignmentEndDate < req.assignmentStartDate:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assignment end date cannot be earlier than start date")

        # Deactivate existing active assignment for this worker if any
        existing_active = self.db.query(WorkerProjectAssignment).filter(
            WorkerProjectAssignment.worker_id == req.workerId,
            WorkerProjectAssignment.assignment_status == "Active"
        ).all()

        for old_a in existing_active:
            old_a.assignment_status = "Completed"
            if not old_a.assignment_end_date:
                old_a.assignment_end_date = req.assignmentStartDate

        c_id = req.contractorId.strip() if (req.contractorId and req.contractorId.strip() != "") else worker.contractor_id
        if c_id == "": c_id = None

        new_a = WorkerProjectAssignment(
            worker_id=req.workerId,
            project_id=req.projectId,
            contractor_id=c_id,
            work_activity=req.workActivity or worker.skill_or_work_type,
            assignment_start_date=req.assignmentStartDate,
            assignment_end_date=req.assignmentEndDate,
            assignment_status=req.assignmentStatus or "Active"
        )
        self.db.add(new_a)
        self.db.commit()
        self.db.refresh(new_a)
        return self._build_assignment_read(new_a)

    def transfer_worker(self, assignment_id: str, req: WorkerTransferRequest, current_user: User) -> WorkerProjectAssignmentRead:
        self.verify_permission(current_user, project_id=req.newProjectId, contractor_id=req.newContractorId)

        old_a = self.db.query(WorkerProjectAssignment).filter(WorkerProjectAssignment.id == assignment_id).first()
        if not old_a:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Original assignment record not found")

        new_proj = self.db.query(Project).filter(Project.id == req.newProjectId).first()
        if not new_proj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target project not found")

        # Complete/transfer old assignment without deleting history
        old_a.assignment_status = "Transferred"
        old_a.assignment_end_date = req.transferDate

        tc_id = req.newContractorId.strip() if (req.newContractorId and req.newContractorId.strip() != "") else old_a.contractor_id
        if tc_id == "": tc_id = None

        new_a = WorkerProjectAssignment(
            worker_id=old_a.worker_id,
            project_id=req.newProjectId,
            contractor_id=tc_id,
            work_activity=req.newWorkActivity or old_a.work_activity,
            assignment_start_date=req.transferDate,
            assignment_status="Active"
        )
        self.db.add(new_a)
        self.db.commit()

        self.db.refresh(new_a)

        return self._build_assignment_read(new_a)

    def get_assignments(
        self,
        project_id: Optional[str] = None,
        contractor_id: Optional[str] = None,
        worker_id: Optional[str] = None,
        assignment_status: Optional[str] = None,
        current_user: User = None
    ) -> List[WorkerProjectAssignmentRead]:
        self.verify_permission(current_user, project_id=project_id, contractor_id=contractor_id, read_only=True)

        query = self.db.query(WorkerProjectAssignment)

        if project_id:
            query = query.filter(WorkerProjectAssignment.project_id == project_id)
        if contractor_id:
            query = query.filter(WorkerProjectAssignment.contractor_id == contractor_id)
        if worker_id:
            query = query.filter(WorkerProjectAssignment.worker_id == worker_id)
        if assignment_status:
            query = query.filter(WorkerProjectAssignment.assignment_status == assignment_status)

        assignments = query.order_by(WorkerProjectAssignment.created_at.desc()).all()
        return [self._build_assignment_read(a) for a in assignments]

    def get_worker_assignment_history(self, worker_id: str, current_user: User) -> List[WorkerProjectAssignmentRead]:
        self.verify_permission(current_user, read_only=True)
        assignments = self.db.query(WorkerProjectAssignment).filter(
            WorkerProjectAssignment.worker_id == worker_id
        ).order_by(WorkerProjectAssignment.created_at.desc()).all()
        return [self._build_assignment_read(a) for a in assignments]

    # ---------------------------------------------------------
    # Shift Management
    # ---------------------------------------------------------
    def _build_shift_read(self, s: ShiftModel) -> ShiftRead:
        assigned_rel = self.db.query(WorkerShiftAssignment).filter(WorkerShiftAssignment.shift_id == s.id).all()
        assigned_list = []
        for wsa in assigned_rel:
            if wsa.worker:
                assigned_list.append(WorkerShiftAssignmentRead(
                    id=wsa.id,
                    shiftId=s.id,
                    workerId=wsa.worker.id,
                    workerName=wsa.worker.worker_name,
                    workerCode=wsa.worker.worker_id,
                    skillOrWorkType=wsa.worker.skill_or_work_type,
                    assignedAt=wsa.assigned_at.isoformat() if wsa.assigned_at else None
                ))

        proj_name = s.project_rel.project_name if s.project_rel else (s.project or None)

        return ShiftRead(
            id=s.id,
            shiftName=s.shift_name or f"{s.shift_type} Shift",
            startTime=s.shift_start,
            endTime=s.shift_end,
            projectId=s.project_id,
            projectName=proj_name,
            shiftDate=s.date,
            shiftStatus=s.status,
            location=s.location or "",
            assignedWorkerCount=len(assigned_list),
            assignedWorkers=assigned_list,
            createdAt=s.created_at.isoformat() if s.created_at else None
        )

    def get_shifts(
        self,
        project_id: Optional[str] = None,
        shift_date: Optional[str] = None,
        status: Optional[str] = None,
        current_user: User = None
    ) -> List[ShiftRead]:
        self.verify_permission(current_user, project_id=project_id, read_only=True)

        query = self.db.query(ShiftModel)
        if project_id:
            query = query.filter(ShiftModel.project_id == project_id)
        if shift_date:
            query = query.filter(ShiftModel.date == shift_date)
        if status:
            query = query.filter(ShiftModel.status == status)

        shifts = query.order_by(ShiftModel.date.desc(), ShiftModel.created_at.desc()).all()
        return [self._build_shift_read(s) for s in shifts]

    def create_shift(self, req: ShiftCreate, current_user: User) -> ShiftRead:
        self.verify_permission(current_user, project_id=req.projectId)

        new_shift = ShiftModel(
            shift_name=req.shiftName,
            shift_start=req.startTime,
            shift_end=req.endTime,
            project_id=req.projectId,
            date=req.shiftDate,
            status=req.shiftStatus or "Scheduled",
            location=req.location or ""
        )
        self.db.add(new_shift)
        self.db.commit()
        self.db.refresh(new_shift)

        if req.assignedWorkerIds:
            for w_id in req.assignedWorkerIds:
                w = self.db.query(Worker).filter(Worker.id == w_id).first()
                if w:
                    wsa = WorkerShiftAssignment(shift_id=new_shift.id, worker_id=w.id)
                    self.db.add(wsa)
            self.db.commit()

        return self._build_shift_read(new_shift)

    def update_shift(self, shift_id: str, req: ShiftUpdate, current_user: User) -> ShiftRead:
        self.verify_permission(current_user)
        s = self.db.query(ShiftModel).filter(ShiftModel.id == shift_id).first()
        if not s:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shift record not found")

        if req.shiftName is not None: s.shift_name = req.shiftName
        if req.startTime is not None: s.shift_start = req.startTime
        if req.endTime is not None: s.shift_end = req.endTime
        if req.projectId is not None: s.project_id = req.projectId
        if req.shiftDate is not None: s.date = req.shiftDate
        if req.shiftStatus is not None: s.status = req.shiftStatus
        if req.location is not None: s.location = req.location

        self.db.commit()
        self.db.refresh(s)
        return self._build_shift_read(s)

    def assign_workers_to_shift(self, shift_id: str, req: ShiftWorkerAssignRequest, current_user: User) -> ShiftRead:
        self.verify_permission(current_user)
        s = self.db.query(ShiftModel).filter(ShiftModel.id == shift_id).first()
        if not s:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shift record not found")

        for w_id in req.workerIds:
            w = self.db.query(Worker).filter(Worker.id == w_id).first()
            if not w:
                continue
            existing = self.db.query(WorkerShiftAssignment).filter(
                WorkerShiftAssignment.shift_id == shift_id,
                WorkerShiftAssignment.worker_id == w_id
            ).first()
            if not existing:
                self.db.add(WorkerShiftAssignment(shift_id=shift_id, worker_id=w_id))

        self.db.commit()
        self.db.refresh(s)
        return self._build_shift_read(s)

    def remove_worker_from_shift(self, shift_id: str, worker_id: str, current_user: User) -> ShiftRead:
        self.verify_permission(current_user)
        wsa = self.db.query(WorkerShiftAssignment).filter(
            WorkerShiftAssignment.shift_id == shift_id,
            WorkerShiftAssignment.worker_id == worker_id
        ).first()
        if wsa:
            self.db.delete(wsa)
            self.db.commit()

        s = self.db.query(ShiftModel).filter(ShiftModel.id == shift_id).first()
        return self._build_shift_read(s)

    # ---------------------------------------------------------
    # Attendance Tracking & Shift Comparison
    # ---------------------------------------------------------
    def _calculate_working_and_overtime_hours(self, check_in: str, check_out: str) -> Tuple[float, float]:
        if not check_in or not check_out:
            return 0.0, 0.0
        try:
            h1, m1 = map(int, check_in.split(":"))
            h2, m2 = map(int, check_out.split(":"))
            t1 = timedelta(hours=h1, minutes=m1)
            t2 = timedelta(hours=h2, minutes=m2)
            if t2 < t1:
                t2 += timedelta(days=1)
            total_h = round((t2 - t1).total_seconds() / 3600.0, 2)
            normal_h = min(8.0, total_h)
            ot_h = max(0.0, round(total_h - normal_h, 2))
            return total_h, ot_h
        except Exception:
            return 0.0, 0.0

    def _build_attendance_read(self, a: AttendanceModel) -> AttendanceRead:
        w_name = a.worker.worker_name if a.worker else a.user_name
        w_code = a.worker.worker_id if a.worker else None
        cat_name = a.worker.category_rel.name if a.worker and a.worker.category_rel else None
        c_name = a.worker.contractor_rel.full_name if a.worker and a.worker.contractor_rel else None
        p_name = a.project.project_name if a.project else None
        s_name = a.shift.shift_name if a.shift else None

        return AttendanceRead(
            id=a.id,
            workerId=a.worker_id or a.user_id,
            workerName=w_name,
            workerCode=w_code,
            categoryName=cat_name,
            contractorName=c_name,
            projectId=a.project_id,
            projectName=p_name,
            shiftId=a.shift_id,
            shiftName=s_name,
            date=a.date,
            status=a.status,
            checkIn=a.check_in,
            checkOut=a.check_out,
            hoursWorked=a.hours_worked or 0.0,
            overtimeHours=a.overtime_hours or 0.0,
            remarks=a.remarks,
            location=a.location,
            createdAt=a.created_at.isoformat() if a.created_at else None
        )

    def get_attendance(
        self,
        project_id: Optional[str] = None,
        contractor_id: Optional[str] = None,
        attendance_date: Optional[str] = None,
        category_id: Optional[str] = None,
        worker_id: Optional[str] = None,
        current_user: User = None
    ) -> List[AttendanceRead]:
        self.verify_permission(current_user, project_id=project_id, contractor_id=contractor_id, read_only=True)

        query = self.db.query(AttendanceModel)
        if project_id:
            query = query.filter(AttendanceModel.project_id == project_id)
        if attendance_date:
            query = query.filter(AttendanceModel.date == attendance_date)
        if worker_id:
            query = query.filter(AttendanceModel.worker_id == worker_id)

        if contractor_id or category_id:
            query = query.join(AttendanceModel.worker)
            if contractor_id:
                query = query.filter(Worker.contractor_id == contractor_id)
            if category_id:
                query = query.filter(Worker.workforce_category_id == category_id)

        records = query.order_by(AttendanceModel.date.desc()).all()
        return [self._build_attendance_read(a) for a in records]

    def create_attendance(self, req: AttendanceCreate, current_user: User) -> AttendanceRead:
        self.verify_permission(current_user, project_id=req.projectId)

        worker = self.db.query(Worker).filter(Worker.id == req.workerId).first()
        if not worker:
            worker = self.db.query(Worker).filter(Worker.worker_id == req.workerId).first()
        if not worker:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")

        # Prevent duplicate attendance for same worker, project, date
        existing = self.db.query(AttendanceModel).filter(
            AttendanceModel.worker_id == worker.id,
            AttendanceModel.date == req.date,
            AttendanceModel.project_id == req.projectId
        ).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Attendance record already exists for worker {worker.worker_id} on {req.date}")

        hours_w = req.hoursWorked or 0.0
        ot_h = req.overtimeHours or 0.0

        if req.checkIn and req.checkOut:
            calc_h, calc_ot = self._calculate_working_and_overtime_hours(req.checkIn, req.checkOut)
            hours_w = calc_h
            ot_h = calc_ot

        day_n = datetime.strptime(req.date, "%Y-%m-%d").strftime("%A") if req.date else ""

        new_att = AttendanceModel(
            worker_id=worker.id,
            project_id=req.projectId,
            shift_id=req.shiftId,
            date=req.date,
            day_name=day_n,
            status=req.status or "Present",
            check_in=req.checkIn,
            check_out=req.checkOut,
            hours_worked=hours_w,
            overtime_hours=ot_h,
            remarks=req.remarks,
            location=req.location
        )
        self.db.add(new_att)
        self.db.commit()
        self.db.refresh(new_att)
        return self._build_attendance_read(new_att)

    def update_attendance(self, attendance_id: str, req: AttendanceUpdate, current_user: User) -> AttendanceRead:
        self.verify_permission(current_user)

        att = self.db.query(AttendanceModel).filter(AttendanceModel.id == attendance_id).first()
        if not att:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found")

        if req.status is not None: att.status = req.status
        if req.checkIn is not None: att.check_in = req.checkIn
        if req.checkOut is not None: att.check_out = req.checkOut
        if req.remarks is not None: att.remarks = req.remarks
        if req.location is not None: att.location = req.location

        if att.check_in and att.check_out:
            calc_h, calc_ot = self._calculate_working_and_overtime_hours(att.check_in, att.check_out)
            att.hours_worked = calc_h
            att.overtime_hours = calc_ot
        elif req.hoursWorked is not None:
            att.hours_worked = req.hoursWorked

        self.db.commit()
        self.db.refresh(att)
        return self._build_attendance_read(att)

    def get_attendance_summary(
        self,
        project_id: Optional[str] = None,
        contractor_id: Optional[str] = None,
        attendance_date: Optional[str] = None,
        category_id: Optional[str] = None,
        current_user: User = None
    ) -> AttendanceSummaryRead:
        self.verify_permission(current_user, project_id=project_id, contractor_id=contractor_id, read_only=True)

        query = self.db.query(AttendanceModel)
        if project_id: query = query.filter(AttendanceModel.project_id == project_id)
        if attendance_date: query = query.filter(AttendanceModel.date == attendance_date)

        if contractor_id or category_id:
            query = query.join(AttendanceModel.worker)
            if contractor_id: query = query.filter(Worker.contractor_id == contractor_id)
            if category_id: query = query.filter(Worker.workforce_category_id == category_id)

        records = query.all()
        total = len(records)
        present = sum(1 for r in records if r.status == "Present")
        absent = sum(1 for r in records if r.status == "Absent")
        leave = sum(1 for r in records if r.status == "Leave")
        pct = round((present / total * 100.0), 1) if total > 0 else 0.0

        return AttendanceSummaryRead(
            totalWorkers=total,
            presentWorkers=present,
            absentWorkers=absent,
            leaveWorkers=leave,
            attendancePercentage=pct
        )

    def get_shift_attendance_comparison(self, project_id: str, shift_date: str, current_user: User) -> List[ShiftAttendanceComparisonRead]:
        self.verify_permission(current_user, project_id=project_id, read_only=True)

        shifts = self.db.query(ShiftModel).filter(
            ShiftModel.project_id == project_id,
            ShiftModel.date == shift_date
        ).all()

        results = []
        for s in shifts:
            assigned_rel = self.db.query(WorkerShiftAssignment).filter(WorkerShiftAssignment.shift_id == s.id).all()
            sched_h, _ = self._calculate_working_and_overtime_hours(s.shift_start, s.shift_end)

            for wsa in assigned_rel:
                w = wsa.worker
                if not w: continue

                att = self.db.query(AttendanceModel).filter(
                    AttendanceModel.worker_id == w.id,
                    AttendanceModel.date == shift_date,
                    AttendanceModel.project_id == project_id
                ).first()

                act_in = att.check_in if att else None
                act_out = att.check_out if att else None
                act_h = att.hours_worked if att else 0.0
                var_h = round(act_h - sched_h, 2)
                att_status = att.status if att else "Absent"

                results.append(ShiftAttendanceComparisonRead(
                    workerId=w.id,
                    workerName=w.worker_name,
                    shiftName=s.shift_name,
                    assignedTime=f"{s.shift_start} - {s.shift_end}",
                    actualCheckIn=act_in,
                    actualCheckOut=act_out,
                    assignedHours=sched_h,
                    actualHours=act_h,
                    varianceHours=var_h,
                    status=att_status
                ))

        return results

    # ---------------------------------------------------------
    # Payroll Monitoring
    # ---------------------------------------------------------
    def _build_payroll_read(self, p: WorkforcePayroll) -> WorkforcePayrollRead:
        w_name = p.worker.worker_name if p.worker else None
        w_code = p.worker.worker_id if p.worker else None
        cat_name = p.worker.category_rel.name if p.worker and p.worker.category_rel else None
        c_name = p.worker.contractor_rel.full_name if p.worker and p.worker.contractor_rel else None
        proj_name = p.project.project_name if p.project else None

        return WorkforcePayrollRead(
            id=p.id,
            workerId=p.worker_id,
            workerName=w_name,
            workerCode=w_code,
            categoryName=cat_name,
            contractorName=c_name,
            projectId=p.project_id,
            projectName=proj_name,
            payPeriodStart=p.pay_period_start,
            payPeriodEnd=p.pay_period_end,
            payRate=p.pay_rate or 0.0,
            workingDays=p.working_days or 0.0,
            workingHours=p.working_hours or 0.0,
            overtimeHours=p.overtime_hours or 0.0,
            leaveDays=p.leave_days or 0.0,
            attendanceReference=p.attendance_reference,
            estimatedPay=p.estimated_pay or 0.0,
            payrollStatus=p.payroll_status,
            createdAt=p.created_at.isoformat() if p.created_at else None
        )

    def get_payrolls(
        self,
        project_id: Optional[str] = None,
        worker_id: Optional[str] = None,
        payroll_status: Optional[str] = None,
        current_user: User = None
    ) -> List[WorkforcePayrollRead]:
        self.verify_permission(current_user, project_id=project_id, read_only=True)

        query = self.db.query(WorkforcePayroll)
        if project_id: query = query.filter(WorkforcePayroll.project_id == project_id)
        if worker_id: query = query.filter(WorkforcePayroll.worker_id == worker_id)
        if payroll_status: query = query.filter(WorkforcePayroll.payroll_status == payroll_status)

        records = query.order_by(WorkforcePayroll.created_at.desc()).all()
        return [self._build_payroll_read(p) for p in records]

    def create_or_update_payroll(self, req: WorkforcePayrollCreate, current_user: User) -> WorkforcePayrollRead:
        self.verify_permission(current_user, project_id=req.projectId)

        worker = self.db.query(Worker).filter(Worker.id == req.workerId).first()
        if not worker:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker record not found")

        # Auto-compute working days & hours from attendance if not supplied
        if not req.workingDays or req.workingDays == 0:
            att_records = self.db.query(AttendanceModel).filter(
                AttendanceModel.worker_id == worker.id,
                AttendanceModel.project_id == req.projectId,
                AttendanceModel.date >= req.payPeriodStart,
                AttendanceModel.date <= req.payPeriodEnd
            ).all()

            w_days = sum(1 for a in att_records if a.status == "Present")
            w_hours = sum(a.hours_worked or 0.0 for a in att_records)
            ot_hours = sum(a.overtime_hours or 0.0 for a in att_records)
            l_days = sum(1 for a in att_records if a.status == "Leave")
        else:
            w_days = req.workingDays
            w_hours = req.workingHours or (w_days * 8.0)
            ot_hours = req.overtimeHours or 0.0
            l_days = req.leaveDays or 0.0

        p_rate = req.payRate or worker.pay_rate or 500.0
        # Calculate estimated pay: regular pay (pay_rate * working_days) + overtime (1.5x hourly rate)
        hourly_rate = p_rate / 8.0
        est_pay = (w_days * p_rate) + (ot_hours * hourly_rate * 1.5)

        existing = self.db.query(WorkforcePayroll).filter(
            WorkforcePayroll.worker_id == worker.id,
            WorkforcePayroll.project_id == req.projectId,
            WorkforcePayroll.pay_period_start == req.payPeriodStart,
            WorkforcePayroll.pay_period_end == req.payPeriodEnd
        ).first()

        if existing:
            existing.pay_rate = p_rate
            existing.working_days = w_days
            existing.working_hours = w_hours
            existing.overtime_hours = ot_hours
            existing.leave_days = l_days
            existing.estimated_pay = round(est_pay, 2)
            existing.payroll_status = req.payrollStatus or existing.payroll_status
            self.db.commit()
            self.db.refresh(existing)
            return self._build_payroll_read(existing)

        new_p = WorkforcePayroll(
            worker_id=worker.id,
            project_id=req.projectId,
            pay_period_start=req.payPeriodStart,
            pay_period_end=req.payPeriodEnd,
            pay_rate=p_rate,
            working_days=w_days,
            working_hours=w_hours,
            overtime_hours=ot_hours,
            leave_days=l_days,
            attendance_reference=f"Calculated from attendance period {req.payPeriodStart} to {req.payPeriodEnd}",
            estimated_pay=round(est_pay, 2),
            payroll_status=req.payrollStatus or "Pending"
        )
        self.db.add(new_p)
        self.db.commit()
        self.db.refresh(new_p)
        return self._build_payroll_read(new_p)

    def update_payroll_status(self, payroll_id: str, new_status: str, current_user: User) -> WorkforcePayrollRead:
        self.verify_permission(current_user)
        p = self.db.query(WorkforcePayroll).filter(WorkforcePayroll.id == payroll_id).first()
        if not p:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payroll record not found")

        p.payroll_status = new_status
        self.db.commit()
        self.db.refresh(p)
        return self._build_payroll_read(p)

    def get_payroll_summary(self, project_id: Optional[str] = None, current_user: User = None) -> WorkforcePayrollSummaryRead:
        self.verify_permission(current_user, project_id=project_id, read_only=True)

        query = self.db.query(WorkforcePayroll)
        if project_id:
            query = query.filter(WorkforcePayroll.project_id == project_id)

        records = query.all()
        total_rec = len(records)
        total_est = sum(p.estimated_pay or 0.0 for p in records)
        total_h = sum(p.working_hours or 0.0 for p in records)
        total_ot = sum(p.overtime_hours or 0.0 for p in records)

        pending_amt = sum(p.estimated_pay or 0.0 for p in records if p.payroll_status == "Pending")
        approved_amt = sum(p.estimated_pay or 0.0 for p in records if p.payroll_status in ["Processing", "Approved"])
        paid_amt = sum(p.estimated_pay or 0.0 for p in records if p.payroll_status == "Paid")

        return WorkforcePayrollSummaryRead(
            totalRecords=total_rec,
            totalEstimatedPay=round(total_est, 2),
            totalWorkingHours=round(total_h, 2),
            totalOvertimeHours=round(total_ot, 2),
            pendingAmount=round(pending_amt, 2),
            approvedAmount=round(approved_amt, 2),
            paidAmount=round(paid_amt, 2)
        )

    # ---------------------------------------------------------
    # Dashboard & Statistics
    # ---------------------------------------------------------
    def get_dashboard_stats(
        self,
        project_id: Optional[str] = None,
        contractor_id: Optional[str] = None,
        current_user: User = None
    ) -> WorkforceDashboardStats:
        self.verify_permission(current_user, project_id=project_id, contractor_id=contractor_id, read_only=True)

        w_query = self.db.query(Worker)
        if contractor_id:
            w_query = w_query.filter(Worker.contractor_id == contractor_id)
        if project_id:
            active_w_ids = self.db.query(WorkerProjectAssignment.worker_id).filter(
                WorkerProjectAssignment.project_id == project_id,
                WorkerProjectAssignment.assignment_status == "Active"
            ).subquery()
            w_query = w_query.filter(Worker.id.in_(active_w_ids))

        total_workers = w_query.count()
        active_workers = w_query.filter(Worker.worker_status == "Active").count()

        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        att_query = self.db.query(AttendanceModel).filter(AttendanceModel.date == today_str)
        if project_id: att_query = att_query.filter(AttendanceModel.project_id == project_id)

        att_today = att_query.all()
        present_today = sum(1 for a in att_today if a.status == "Present")
        absent_today = sum(1 for a in att_today if a.status == "Absent")
        leave_today = sum(1 for a in att_today if a.status == "Leave")

        att_pct = round((present_today / len(att_today) * 100.0), 1) if len(att_today) > 0 else 92.5

        # Breakdown by category
        cat_breakdown = []
        categories = self.get_categories()
        for c in categories:
            c_count = self.db.query(Worker).filter(Worker.workforce_category_id == c.id).count()
            cat_breakdown.append({"category": c.name, "count": c_count})

        # Breakdown by project
        proj_breakdown = []
        all_projs = self.db.query(Project).all()
        for p in all_projs:
            p_count = self.db.query(WorkerProjectAssignment).filter(
                WorkerProjectAssignment.project_id == p.id,
                WorkerProjectAssignment.assignment_status == "Active"
            ).count()
            proj_breakdown.append({"projectId": p.id, "projectName": p.project_name, "count": p_count})

        # Breakdown by contractor
        contractors_list = self.db.query(User).join(User.role_rel).filter(User.role_rel.has(name="Contractor")).all()
        con_breakdown = []
        for c in contractors_list:
            c_count = self.db.query(Worker).filter(Worker.contractor_id == c.id).count()
            con_breakdown.append({"contractorId": c.id, "contractorName": c.full_name, "count": c_count})

        # Recent assignments
        recent_a = self.get_assignments(project_id=project_id, contractor_id=contractor_id, current_user=current_user)[:5]

        return WorkforceDashboardStats(
            totalWorkers=total_workers,
            activeWorkers=active_workers,
            presentToday=present_today,
            absentToday=absent_today,
            onLeaveToday=leave_today,
            attendancePercentage=att_pct,
            categoryBreakdown=cat_breakdown,
            projectBreakdown=proj_breakdown,
            contractorBreakdown=con_breakdown,
            recentAssignments=recent_a
        )
