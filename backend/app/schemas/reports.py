from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ReportFilterParams(BaseModel):
    project_id: str
    report_type: str  # progress, resources, workforce, procurement, budget
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status_filter: Optional[str] = None
    category_filter: Optional[str] = None
    search: Optional[str] = None

class ProjectProgressReportRead(BaseModel):
    project_id: str
    project_code: str
    project_name: str
    category: str
    status: str
    start_date: Optional[str] = None
    expected_completion_date: Optional[str] = None
    overall_progress: float
    project_manager_name: str
    total_milestones: int
    completed_milestones: int
    pending_milestones: int
    delayed_milestones: int
    milestone_velocity: float
    milestones: List[Dict[str, Any]]
    daily_reports_count: int
    weekly_reports_count: int
    delay_incidents_count: int
    recent_daily_reports: List[Dict[str, Any]]
    delay_incidents: List[Dict[str, Any]]

class ResourceUtilizationReportRead(BaseModel):
    project_id: str
    project_code: str
    project_name: str
    total_allocated_equipment: int
    active_equipment_count: int
    available_equipment_count: int
    maintenance_count: int
    utilization_rate_percentage: float
    allocated_resources: List[Dict[str, Any]]
    equipment_fleet: List[Dict[str, Any]]

class WorkforceReportRead(BaseModel):
    project_id: str
    project_code: str
    project_name: str
    total_assigned_workers: int
    present_today_count: int
    absent_today_count: int
    attendance_rate_percentage: float
    attendance_status: str
    assigned_workers: List[Dict[str, Any]]
    recent_attendance: List[Dict[str, Any]]
    payroll_summary: List[Dict[str, Any]]

class ProcurementReportRead(BaseModel):
    project_id: str
    project_code: str
    project_name: str
    total_requests: int
    pending_approval_count: int
    approved_requests_count: int
    purchase_orders_count: int
    purchase_orders_total_amount: float
    total_invoices_count: int
    requests: List[Dict[str, Any]]
    purchase_orders: List[Dict[str, Any]]

class BudgetReportRead(BaseModel):
    project_id: str
    project_code: str
    project_name: str
    estimated_budget: float
    total_procurement_spent: float
    total_purchase_orders_spent: float
    utilized_budget: float
    remaining_budget: float
    utilization_percentage: float
    budget_status: str
    purchase_order_expenses: List[Dict[str, Any]]
    module_11_notice: str
