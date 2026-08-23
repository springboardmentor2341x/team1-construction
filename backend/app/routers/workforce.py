from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.schemas.workforce import (
    WorkforceCategoryRead,
    WorkerRead,
    WorkerCreate,
    WorkerUpdate,
    WorkerStatusUpdate,
    WorkerBulkImportRequest,
    WorkerBulkImportResult,
    PaginatedWorkersResponse,
    WorkerProjectAssignmentRead,
    WorkerProjectAssignmentCreate,
    WorkerTransferRequest,
    ShiftRead,
    ShiftCreate,
    ShiftUpdate,
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
from app.services.workforce_service import WorkforceService

router = APIRouter(prefix="/workforce", tags=["Workforce Management"])


# ---------------------------------------------------------
# Categories
# ---------------------------------------------------------
@router.get("/categories", response_model=List[WorkforceCategoryRead])
def get_workforce_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkforceService(db)
    return service.get_categories()


# ---------------------------------------------------------
# Workers
# ---------------------------------------------------------
@router.get("/workers", response_model=PaginatedWorkersResponse)
def get_workers(
    search: Optional[str] = Query(None, description="Search by ID, name, or skill"),
    categoryId: Optional[str] = Query(None, alias="categoryId"),
    contractorId: Optional[str] = Query(None, alias="contractorId"),
    projectId: Optional[str] = Query(None, alias="projectId"),
    workerStatus: Optional[str] = Query(None, alias="workerStatus"),
    skill: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=1000, alias="pageSize"),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkforceService(db)
    return service.get_workers(
        search=search,
        category_id=categoryId,
        contractor_id=contractorId,
        project_id=projectId,
        worker_status=workerStatus,
        skill=skill,
        page=page,
        page_size=pageSize,
        current_user=current_user
    )


@router.post("/workers", response_model=WorkerRead, status_code=status.HTTP_201_CREATED)
def create_worker(
    req: WorkerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Contractor", "Site Engineer"]))
):
    service = WorkforceService(db)
    return service.create_worker(req, current_user)


@router.post("/workers/bulk-import", response_model=WorkerBulkImportResult)
def bulk_import_workers(
    req: WorkerBulkImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Contractor"]))
):
    service = WorkforceService(db)
    return service.bulk_import_workers(req, current_user)


@router.get("/workers/{worker_id}", response_model=WorkerRead)
def get_worker_by_id(
    worker_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkforceService(db)
    return service.get_worker_by_id(worker_id, current_user)


@router.put("/workers/{worker_id}", response_model=WorkerRead)
def update_worker(
    worker_id: str,
    req: WorkerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Contractor"]))
):
    service = WorkforceService(db)
    return service.update_worker(worker_id, req, current_user)


@router.put("/workers/{worker_id}/status", response_model=WorkerRead)
def change_worker_status(
    worker_id: str,
    req: WorkerStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Contractor"]))
):
    service = WorkforceService(db)
    return service.change_worker_status(worker_id, req.workerStatus, current_user)


# ---------------------------------------------------------
# Assignments & Allocations
# ---------------------------------------------------------
@router.get("/assignments", response_model=List[WorkerProjectAssignmentRead])
def get_assignments(
    projectId: Optional[str] = Query(None, alias="projectId"),
    contractorId: Optional[str] = Query(None, alias="contractorId"),
    workerId: Optional[str] = Query(None, alias="workerId"),
    assignmentStatus: Optional[str] = Query(None, alias="assignmentStatus"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkforceService(db)
    return service.get_assignments(
        project_id=projectId,
        contractor_id=contractorId,
        worker_id=workerId,
        assignment_status=assignmentStatus,
        current_user=current_user
    )


@router.post("/assignments", response_model=WorkerProjectAssignmentRead, status_code=status.HTTP_201_CREATED)
def create_assignment(
    req: WorkerProjectAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Contractor"]))
):
    service = WorkforceService(db)
    return service.create_assignment(req, current_user)


@router.post("/assignments/{assignment_id}/transfer", response_model=WorkerProjectAssignmentRead)
def transfer_worker(
    assignment_id: str,
    req: WorkerTransferRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Contractor"]))
):
    service = WorkforceService(db)
    return service.transfer_worker(assignment_id, req, current_user)


@router.get("/assignments/history/{worker_id}", response_model=List[WorkerProjectAssignmentRead])
def get_worker_assignment_history(
    worker_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkforceService(db)
    return service.get_worker_assignment_history(worker_id, current_user)


# ---------------------------------------------------------
# Shifts
# ---------------------------------------------------------
@router.get("/shifts", response_model=List[ShiftRead])
def get_shifts(
    projectId: Optional[str] = Query(None, alias="projectId"),
    shiftDate: Optional[str] = Query(None, alias="shiftDate"),
    shiftStatus: Optional[str] = Query(None, alias="shiftStatus"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkforceService(db)
    return service.get_shifts(project_id=projectId, shift_date=shiftDate, status=shiftStatus, current_user=current_user)


@router.post("/shifts", response_model=ShiftRead, status_code=status.HTTP_201_CREATED)
def create_shift(
    req: ShiftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    service = WorkforceService(db)
    return service.create_shift(req, current_user)


@router.put("/shifts/{shift_id}", response_model=ShiftRead)
def update_shift(
    shift_id: str,
    req: ShiftUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    service = WorkforceService(db)
    return service.update_shift(shift_id, req, current_user)


@router.post("/shifts/{shift_id}/workers", response_model=ShiftRead)
def assign_workers_to_shift(
    shift_id: str,
    req: ShiftWorkerAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    service = WorkforceService(db)
    return service.assign_workers_to_shift(shift_id, req, current_user)


@router.delete("/shifts/{shift_id}/workers/{worker_id}", response_model=ShiftRead)
def remove_worker_from_shift(
    shift_id: str,
    worker_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    service = WorkforceService(db)
    return service.remove_worker_from_shift(shift_id, worker_id, current_user)


# ---------------------------------------------------------
# Attendance
# ---------------------------------------------------------
@router.get("/attendance", response_model=List[AttendanceRead])
def get_attendance(
    projectId: Optional[str] = Query(None, alias="projectId"),
    contractorId: Optional[str] = Query(None, alias="contractorId"),
    attendanceDate: Optional[str] = Query(None, alias="attendanceDate"),
    categoryId: Optional[str] = Query(None, alias="categoryId"),
    workerId: Optional[str] = Query(None, alias="workerId"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkforceService(db)
    return service.get_attendance(
        project_id=projectId,
        contractor_id=contractorId,
        attendance_date=attendanceDate,
        category_id=categoryId,
        worker_id=workerId,
        current_user=current_user
    )


@router.post("/attendance", response_model=AttendanceRead, status_code=status.HTTP_201_CREATED)
def create_attendance(
    req: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer", "Contractor", "Worker"]))
):
    service = WorkforceService(db)
    return service.create_attendance(req, current_user)


@router.put("/attendance/{attendance_id}", response_model=AttendanceRead)
def update_attendance(
    attendance_id: str,
    req: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer", "Contractor"]))
):
    service = WorkforceService(db)
    return service.update_attendance(attendance_id, req, current_user)


@router.get("/attendance/summary", response_model=AttendanceSummaryRead)
def get_attendance_summary(
    projectId: Optional[str] = Query(None, alias="projectId"),
    contractorId: Optional[str] = Query(None, alias="contractorId"),
    attendanceDate: Optional[str] = Query(None, alias="attendanceDate"),
    categoryId: Optional[str] = Query(None, alias="categoryId"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkforceService(db)
    return service.get_attendance_summary(
        project_id=projectId,
        contractor_id=contractorId,
        attendance_date=attendanceDate,
        category_id=categoryId,
        current_user=current_user
    )


@router.get("/attendance/shift-comparison", response_model=List[ShiftAttendanceComparisonRead])
def get_shift_attendance_comparison(
    projectId: str = Query(..., alias="projectId"),
    shiftDate: str = Query(..., alias="shiftDate"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkforceService(db)
    return service.get_shift_attendance_comparison(project_id=projectId, shift_date=shiftDate, current_user=current_user)


# ---------------------------------------------------------
# Payroll Monitoring
# ---------------------------------------------------------
@router.get("/payroll", response_model=List[WorkforcePayrollRead])
def get_payrolls(
    projectId: Optional[str] = Query(None, alias="projectId"),
    workerId: Optional[str] = Query(None, alias="workerId"),
    payrollStatus: Optional[str] = Query(None, alias="payrollStatus"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkforceService(db)
    return service.get_payrolls(project_id=projectId, worker_id=workerId, payroll_status=payrollStatus, current_user=current_user)


@router.post("/payroll", response_model=WorkforcePayrollRead, status_code=status.HTTP_201_CREATED)
def create_or_update_payroll(
    req: WorkforcePayrollCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Contractor"]))
):
    service = WorkforceService(db)
    return service.create_or_update_payroll(req, current_user)


@router.put("/payroll/{payroll_id}/status", response_model=WorkforcePayrollRead)
def update_payroll_status(
    payroll_id: str,
    status_value: str = Query(..., alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    service = WorkforceService(db)
    return service.update_payroll_status(payroll_id, status_value, current_user)


@router.get("/payroll/summary", response_model=WorkforcePayrollSummaryRead)
def get_payroll_summary(
    projectId: Optional[str] = Query(None, alias="projectId"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkforceService(db)
    return service.get_payroll_summary(project_id=projectId, current_user=current_user)


# ---------------------------------------------------------
# Dashboard Stats
# ---------------------------------------------------------
@router.get("/dashboard", response_model=WorkforceDashboardStats)
def get_workforce_dashboard(
    projectId: Optional[str] = Query(None, alias="projectId"),
    contractorId: Optional[str] = Query(None, alias="contractorId"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WorkforceService(db)
    return service.get_dashboard_stats(project_id=projectId, contractor_id=contractorId, current_user=current_user)
