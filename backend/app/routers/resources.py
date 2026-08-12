from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.orm import Session

from app.dependencies.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RequireRole
from app.models.user import User
from app.services.resource_service import ResourceService
from app.schemas.resource import (
    ResourceCreate,
    ResourceUpdate,
    ResourceStatusUpdate,
    ResourceRead,
    ResourceAllocationCreate,
    ResourceAllocationReturn,
    ResourceAllocationRead,
    ResourceUtilizationCreate,
    ResourceUtilizationRead,
    ResourceMaintenanceCreate,
    ResourceMaintenanceUpdate,
    ResourceMaintenanceRead,
    ResourceDashboardRead,
    RESOURCE_CATEGORIES,
)

router = APIRouter(prefix="/resources", tags=["Resource Management"])


# ------------------------------------------------------------------
# Resource Categories & Dashboard
# ------------------------------------------------------------------
@router.get("/categories", response_model=List[str])
def get_categories(
    current_user: User = Depends(get_current_user)
):
    """List standard construction resource categories."""
    return RESOURCE_CATEGORIES


@router.get("/dashboard", response_model=ResourceDashboardRead)
def get_resource_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve real-time resource KPIs, status counts, utilization, and maintenance alerts."""
    service = ResourceService(db)
    return service.get_dashboard()


@router.get("/availability", response_model=List[ResourceRead])
def check_resource_availability(
    category: Optional[str] = Query(None),
    startDate: Optional[str] = Query(None),
    endDate: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Find equipment available for allocation within a date range."""
    service = ResourceService(db)
    return service.check_availability(category, startDate, endDate)


# ------------------------------------------------------------------
# Resource Master Data Endpoints
# ------------------------------------------------------------------
@router.get("", response_model=List[ResourceRead])
def get_resources(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    projectId: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List and filter all equipment resources."""
    service = ResourceService(db)
    return service.get_resources(search, category, status, projectId, location)


@router.post("", response_model=ResourceRead, status_code=status.HTTP_201_CREATED)
def create_resource(
    req: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    """Create a new equipment resource with a unique Equipment Code."""
    service = ResourceService(db)
    return service.create_resource(req, current_user)


@router.get("/{resource_id}", response_model=ResourceRead)
def get_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get equipment resource details by ID."""
    service = ResourceService(db)
    return service.get_resource_by_id(resource_id)


@router.put("/{resource_id}", response_model=ResourceRead)
def update_resource(
    resource_id: str,
    req: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    """Update equipment details."""
    service = ResourceService(db)
    return service.update_resource(resource_id, req, current_user)


@router.patch("/{resource_id}/status", response_model=ResourceRead)
def update_resource_status(
    resource_id: str,
    req: ResourceStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    """Update equipment operational status."""
    service = ResourceService(db)
    return service.update_resource_status(resource_id, req.status, current_user)


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator"]))
):
    """Delete an equipment resource."""
    service = ResourceService(db)
    service.delete_resource(resource_id)
    return None


# ------------------------------------------------------------------
# Resource Allocation Endpoints
# ------------------------------------------------------------------
@router.get("/allocations/list", response_model=List[ResourceAllocationRead])
def get_allocations(
    projectId: Optional[str] = Query(None),
    resourceId: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List equipment allocation records."""
    service = ResourceService(db)
    return service.get_allocations(projectId, resourceId, status)


@router.post("/allocations", response_model=ResourceAllocationRead, status_code=status.HTTP_201_CREATED)
def create_allocation(
    req: ResourceAllocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    """Allocate equipment to a project with overlap & maintenance conflict prevention."""
    service = ResourceService(db)
    return service.create_allocation(req, current_user)


@router.post("/allocations/{allocation_id}/return", response_model=ResourceAllocationRead)
def return_allocation(
    allocation_id: str,
    req: Optional[ResourceAllocationReturn] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    """Return allocated equipment and restore resource availability."""
    service = ResourceService(db)
    return_date = req.actualReturnDate if req else None
    return service.return_allocation(allocation_id, return_date, current_user)


# ------------------------------------------------------------------
# Resource Utilization Endpoints
# ------------------------------------------------------------------
@router.get("/utilization/list", response_model=List[ResourceUtilizationRead])
def get_utilizations(
    resourceId: Optional[str] = Query(None),
    projectId: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List resource utilization logs."""
    service = ResourceService(db)
    return service.get_utilizations(resourceId, projectId)


@router.post("/utilization", response_model=ResourceUtilizationRead, status_code=status.HTTP_201_CREATED)
def create_utilization(
    req: ResourceUtilizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    """Record daily equipment operating hours and auto-calculate utilization %."""
    service = ResourceService(db)
    return service.create_utilization(req, current_user)


# ------------------------------------------------------------------
# Maintenance Scheduling Endpoints
# ------------------------------------------------------------------
@router.get("/maintenance/due", response_model=Dict[str, Any])
def get_maintenance_due(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get due, overdue, and in-progress maintenance records and trigger alerts."""
    service = ResourceService(db)
    return service.get_maintenance_due()


@router.get("/maintenance/list", response_model=List[ResourceMaintenanceRead])
def get_maintenances(
    resourceId: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List maintenance records & history."""
    service = ResourceService(db)
    return service.get_maintenances(resourceId, status)


@router.post("/maintenance", response_model=ResourceMaintenanceRead, status_code=status.HTTP_201_CREATED)
def create_maintenance(
    req: ResourceMaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager"]))
):
    """Schedule or log maintenance for a resource."""
    service = ResourceService(db)
    return service.create_maintenance(req, current_user)


@router.put("/maintenance/{maintenance_id}", response_model=ResourceMaintenanceRead)
def update_maintenance(
    maintenance_id: str,
    req: ResourceMaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["Administrator", "Project Manager", "Site Engineer"]))
):
    """Update maintenance status or mark maintenance as Completed."""
    service = ResourceService(db)
    return service.update_maintenance(maintenance_id, req, current_user)
