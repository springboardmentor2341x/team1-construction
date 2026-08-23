from typing import List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime


# --- Category Schemas ---
class WorkforceCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class WorkforceCategoryCreate(WorkforceCategoryBase):
    pass


class WorkforceCategoryRead(WorkforceCategoryBase):
    id: str
    workerCount: Optional[int] = 0
    createdAt: Optional[str] = None

    class Config:
        from_attributes = True


# --- Worker Schemas ---
class WorkerBase(BaseModel):
    workerId: str
    workerName: str
    contactInformation: Optional[str] = None
    workforceCategoryId: str
    skillOrWorkType: Optional[str] = None
    contractorId: Optional[str] = None
    joiningDate: str
    workerStatus: Optional[str] = "Active"
    payRate: Optional[float] = 0.0


class WorkerCreate(WorkerBase):
    pass


class WorkerUpdate(BaseModel):
    workerName: Optional[str] = None
    contactInformation: Optional[str] = None
    workforceCategoryId: Optional[str] = None
    skillOrWorkType: Optional[str] = None
    contractorId: Optional[str] = None
    joiningDate: Optional[str] = None
    workerStatus: Optional[str] = None
    payRate: Optional[float] = None


class WorkerStatusUpdate(BaseModel):
    workerStatus: str


class WorkerRead(WorkerBase):
    id: str
    categoryName: Optional[str] = None
    contractorName: Optional[str] = None
    currentProjectId: Optional[str] = None
    currentProjectName: Optional[str] = None
    currentAssignmentId: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

    class Config:
        from_attributes = True


class PaginatedWorkersResponse(BaseModel):
    items: List[WorkerRead]
    total: int
    page: int
    pageSize: int
    totalPages: int


class WorkerBulkImportItem(BaseModel):
    workerId: str
    workerName: str
    contactInformation: Optional[str] = None
    categoryName: str
    skillOrWorkType: Optional[str] = None
    contractorEmailOrId: Optional[str] = None
    projectCodeOrId: Optional[str] = None
    joiningDate: Optional[str] = None
    workerStatus: Optional[str] = "Active"
    payRate: Optional[float] = 0.0


class WorkerBulkImportRequest(BaseModel):
    workers: List[WorkerBulkImportItem]


class WorkerBulkImportResult(BaseModel):
    totalProcessed: int
    successCount: int
    failureCount: int
    errors: List[str]
    createdWorkers: List[WorkerRead]


# --- Assignment Schemas ---
class WorkerProjectAssignmentBase(BaseModel):
    workerId: str
    projectId: str
    contractorId: Optional[str] = None
    workActivity: Optional[str] = None
    assignmentStartDate: str
    assignmentEndDate: Optional[str] = None
    assignmentStatus: Optional[str] = "Active"


class WorkerProjectAssignmentCreate(WorkerProjectAssignmentBase):
    pass


class WorkerProjectAssignmentUpdate(BaseModel):
    contractorId: Optional[str] = None
    workActivity: Optional[str] = None
    assignmentStartDate: Optional[str] = None
    assignmentEndDate: Optional[str] = None
    assignmentStatus: Optional[str] = None


class WorkerTransferRequest(BaseModel):
    newProjectId: str
    newContractorId: Optional[str] = None
    newWorkActivity: Optional[str] = None
    transferDate: str


class WorkerProjectAssignmentRead(WorkerProjectAssignmentBase):
    id: str
    workerName: Optional[str] = None
    workerCode: Optional[str] = None
    projectName: Optional[str] = None
    projectCode: Optional[str] = None
    contractorName: Optional[str] = None
    createdAt: Optional[str] = None

    class Config:
        from_attributes = True


# --- Shift Schemas ---
class ShiftWorkerAssignRequest(BaseModel):
    workerIds: List[str]


class WorkerShiftAssignmentRead(BaseModel):
    id: str
    shiftId: str
    workerId: str
    workerName: str
    workerCode: Optional[str] = None
    skillOrWorkType: Optional[str] = None
    assignedAt: Optional[str] = None


class ShiftBase(BaseModel):
    shiftName: str
    startTime: str
    endTime: str
    projectId: Optional[str] = None
    shiftDate: str
    shiftStatus: Optional[str] = "Scheduled"
    location: Optional[str] = ""


class ShiftCreate(ShiftBase):
    assignedWorkerIds: Optional[List[str]] = []


class ShiftUpdate(BaseModel):
    shiftName: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    projectId: Optional[str] = None
    shiftDate: Optional[str] = None
    shiftStatus: Optional[str] = None
    location: Optional[str] = None


class ShiftRead(ShiftBase):
    id: str
    projectName: Optional[str] = None
    assignedWorkerCount: int = 0
    assignedWorkers: List[WorkerShiftAssignmentRead] = []
    createdAt: Optional[str] = None

    class Config:
        from_attributes = True


# --- Attendance Schemas ---
class AttendanceBase(BaseModel):
    workerId: str
    projectId: Optional[str] = None
    shiftId: Optional[str] = None
    date: str
    status: Optional[str] = "Present"  # Present, Absent, Leave
    checkIn: Optional[str] = None
    checkOut: Optional[str] = None
    hoursWorked: Optional[float] = 0.0
    overtimeHours: Optional[float] = 0.0
    remarks: Optional[str] = None
    location: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    checkIn: Optional[str] = None
    checkOut: Optional[str] = None
    hoursWorked: Optional[float] = None
    overtimeHours: Optional[float] = None
    remarks: Optional[str] = None
    location: Optional[str] = None


class AttendanceRead(AttendanceBase):
    id: str
    workerName: str
    workerCode: Optional[str] = None
    categoryName: Optional[str] = None
    contractorName: Optional[str] = None
    projectName: Optional[str] = None
    shiftName: Optional[str] = None
    createdAt: Optional[str] = None

    class Config:
        from_attributes = True


class AttendanceSummaryRead(BaseModel):
    totalWorkers: int
    presentWorkers: int
    absentWorkers: int
    leaveWorkers: int
    attendancePercentage: float


class ShiftAttendanceComparisonRead(BaseModel):
    workerId: str
    workerName: str
    shiftName: str
    assignedTime: str  # e.g. 09:00 - 18:00
    actualCheckIn: Optional[str]
    actualCheckOut: Optional[str]
    assignedHours: float
    actualHours: float
    varianceHours: float
    status: str


# --- Payroll Schemas ---
class WorkforcePayrollBase(BaseModel):
    workerId: str
    projectId: str
    payPeriodStart: str
    payPeriodEnd: str
    payRate: Optional[float] = 0.0
    workingDays: Optional[float] = 0.0
    workingHours: Optional[float] = 0.0
    overtimeHours: Optional[float] = 0.0
    leaveDays: Optional[float] = 0.0
    attendanceReference: Optional[str] = None
    estimatedPay: Optional[float] = 0.0
    payrollStatus: Optional[str] = "Pending"  # Pending, Processing, Approved, Paid


class WorkforcePayrollCreate(WorkforcePayrollBase):
    pass


class WorkforcePayrollUpdate(BaseModel):
    payRate: Optional[float] = None
    workingDays: Optional[float] = None
    workingHours: Optional[float] = None
    overtimeHours: Optional[float] = None
    leaveDays: Optional[float] = None
    estimatedPay: Optional[float] = None
    payrollStatus: Optional[str] = None


class WorkforcePayrollRead(WorkforcePayrollBase):
    id: str
    workerName: str
    workerCode: Optional[str] = None
    categoryName: Optional[str] = None
    contractorName: Optional[str] = None
    projectName: Optional[str] = None
    createdAt: Optional[str] = None

    class Config:
        from_attributes = True


class WorkforcePayrollSummaryRead(BaseModel):
    totalRecords: int
    totalEstimatedPay: float
    totalWorkingHours: float
    totalOvertimeHours: float
    pendingAmount: float
    approvedAmount: float
    paidAmount: float


# --- Dashboard Schemas ---
class WorkforceDashboardStats(BaseModel):
    totalWorkers: int
    activeWorkers: int
    presentToday: int
    absentToday: int
    onLeaveToday: int
    attendancePercentage: float
    categoryBreakdown: List[dict]
    projectBreakdown: List[dict]
    contractorBreakdown: List[dict]
    recentAssignments: List[WorkerProjectAssignmentRead]
