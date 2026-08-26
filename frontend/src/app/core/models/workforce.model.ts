export interface WorkforceCategory {
  id: string;
  name: string;
  description?: string;
  workerCount?: number;
  createdAt?: string;
}

export interface Worker {
  id: string;
  workerId: string;
  workerName: string;
  contactInformation?: string;
  workforceCategoryId: string;
  categoryName?: string;
  skillOrWorkType?: string;
  contractorId?: string;
  contractorName?: string;
  joiningDate: string;
  workerStatus: 'Active' | 'Inactive' | 'On Leave' | 'Terminated' | string;
  payRate?: number;
  currentProjectId?: string;
  currentProjectName?: string;
  currentAssignmentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedWorkersResponse {
  items: Worker[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface WorkerBulkImportItem {
  workerId: string;
  workerName: string;
  contactInformation?: string;
  categoryName: string;
  skillOrWorkType?: string;
  contractorEmailOrId?: string;
  projectCodeOrId?: string;
  joiningDate?: string;
  workerStatus?: string;
  payRate?: number;
}

export interface WorkerBulkImportResult {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  errors: string[];
  createdWorkers: Worker[];
}

export interface WorkerProjectAssignment {
  id: string;
  workerId: string;
  workerName?: string;
  workerCode?: string;
  projectId: string;
  projectName?: string;
  projectCode?: string;
  contractorId?: string;
  contractorName?: string;
  workActivity?: string;
  assignmentStartDate: string;
  assignmentEndDate?: string;
  assignmentStatus: 'Active' | 'Completed' | 'Transferred' | 'Cancelled' | string;
  createdAt?: string;
}

export interface WorkerTransferRequest {
  newProjectId: string;
  newContractorId?: string;
  newWorkActivity?: string;
  transferDate: string;
}

export interface WorkerShiftAssignment {
  id: string;
  shiftId: string;
  workerId: string;
  workerName: string;
  workerCode?: string;
  skillOrWorkType?: string;
  assignedAt?: string;
}

export interface Shift {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  projectId?: string;
  projectName?: string;
  shiftDate: string;
  shiftStatus: 'Scheduled' | 'Active' | 'Completed' | 'Cancelled' | string;
  location?: string;
  assignedWorkerCount: number;
  assignedWorkers: WorkerShiftAssignment[];
  createdAt?: string;
}

export interface Attendance {
  id: string;
  workerId: string;
  workerName: string;
  workerCode?: string;
  categoryName?: string;
  contractorName?: string;
  projectId?: string;
  projectName?: string;
  shiftId?: string;
  shiftName?: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave' | string;
  checkIn?: string;
  checkOut?: string;
  hoursWorked: number;
  overtimeHours: number;
  remarks?: string;
  location?: string;
  createdAt?: string;
}

export interface AttendanceSummary {
  totalWorkers: number;
  presentWorkers: number;
  absentWorkers: number;
  leaveWorkers: number;
  attendancePercentage: number;
}

export interface ShiftAttendanceComparison {
  workerId: string;
  workerName: string;
  shiftName: string;
  assignedTime: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  assignedHours: number;
  actualHours: number;
  varianceHours: number;
  status: string;
}

export interface WorkforcePayroll {
  id: string;
  workerId: string;
  workerName: string;
  workerCode?: string;
  categoryName?: string;
  contractorName?: string;
  projectId: string;
  projectName?: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payRate: number;
  workingDays: number;
  workingHours: number;
  overtimeHours: number;
  leaveDays: number;
  attendanceReference?: string;
  estimatedPay: number;
  payrollStatus: 'Pending' | 'Processing' | 'Approved' | 'Paid' | string;
  createdAt?: string;
}

export interface WorkforcePayrollSummary {
  totalRecords: number;
  totalEstimatedPay: number;
  totalWorkingHours: number;
  totalOvertimeHours: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
}

export interface WorkforceDashboardStats {
  totalWorkers: number;
  activeWorkers: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  attendancePercentage: number;
  categoryBreakdown: { category: string; count: number }[];
  projectBreakdown: { projectId: string; projectName: string; count: number }[];
  contractorBreakdown: { contractorId: string; contractorName: string; count: number }[];
  recentAssignments: WorkerProjectAssignment[];
}
